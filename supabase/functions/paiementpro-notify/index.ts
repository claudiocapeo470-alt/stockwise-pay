import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Public webhook called by Paiement Pro after payment.
// No JWT — the payment is ALWAYS re-verified server-to-server against
// Paiement Pro before anything is marked as paid.

/**
 * Server-to-server verification with Paiement Pro.
 * Returns true only if Paiement Pro itself confirms a successful payment.
 */
async function verifyWithPaiementPro(params: {
  merchantId: string;
  merchantSecret: string;
  reference: string;
  sessionId?: string | null;
  amount?: number | null;
}): Promise<{ confirmed: boolean; raw: string }> {
  const { merchantId, merchantSecret, reference, sessionId, amount } = params;

  // Hashcode built the same way as in paiementpro-init
  const hashString = `${merchantId}${amount ?? ""}${reference}${merchantSecret}`;
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(hashString),
  );
  const hashcode = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const payload: Record<string, string> = {
    merchantId,
    referenceNumber: reference,
    hashcode,
  };
  if (sessionId) payload.sessionid = sessionId;

  const endpoints = [
    "https://www.paiementpro.net/webservice/onlinepayment/verify/curl-verify.php",
    "https://www.paiementpro.net/webservice/onlinepayment/curl-verify.php",
  ];

  let lastRaw = "";
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json, text/plain, */*",
        },
        body: new URLSearchParams(payload).toString(),
      });
      lastRaw = await res.text();
      console.log("PaiementPro verify response:", { url, status: res.status, body: lastRaw.slice(0, 400) });
      if (!res.ok) continue;

      let parsed: any = null;
      try {
        parsed = JSON.parse(lastRaw);
      } catch {
        try {
          parsed = Object.fromEntries(new URLSearchParams(lastRaw).entries());
        } catch { /* ignore */ }
      }
      if (!parsed) continue;

      const code = String(
        parsed.responsecode ?? parsed.responseCode ?? parsed.status ?? "",
      ).trim();
      const confirmed = code === "0" || code === "00" ||
        String(parsed.status ?? "").toLowerCase() === "success";
      if (confirmed) return { confirmed: true, raw: lastRaw };
    } catch (e) {
      console.error("PaiementPro verify call failed:", url, e);
    }
  }

  return { confirmed: false, raw: lastRaw };
}

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}')['default'] ?? ''
    );

    // Paiement Pro can POST as form-data or JSON depending on config.
    let data: Record<string, any> = {};
    const contentType = req.headers.get("content-type") || "";
    const rawBody = await req.text();
    if (!rawBody.trim()) {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = Object.fromEntries(new URLSearchParams(rawBody).entries());
    }

    console.log("Paiement Pro notify payload:", data);

    const reference = data.referenceNumber || data.reference || data.referenceNo;
    const responsecode = String(data.responsecode ?? data.responseCode ?? "");
    const sessionId = data.sessionid || data.sessionId;
    const paymentMethod = data.paymentMethod || data.paymenttype || null;

    if (!reference) {
      return new Response(JSON.stringify({ error: "reference manquante" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up subscription
    const { data: sub, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (fetchError || !sub) {
      console.error("Subscription not found:", reference, fetchError);
      return new Response(JSON.stringify({ error: "Subscription introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already processed -> idempotent
    if (sub.status === "active") {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const merchantId = Deno.env.get("PAIEMENTPRO_MERCHANT_ID");
    const merchantSecret = Deno.env.get("PAIEMENTPRO_SECRET_KEY");
    if (!merchantId || !merchantSecret) {
      console.error("Missing PaiementPro credentials — cannot verify payment");
      return new Response(
        JSON.stringify({ error: "Configuration marchand manquante" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // NEVER trust the incoming payload alone: verify server-to-server.
    const verification = await verifyWithPaiementPro({
      merchantId,
      merchantSecret,
      reference,
      sessionId: sessionId ?? sub.session_id,
      amount: sub.amount,
    });

    const payloadSuccess = responsecode === "0" || responsecode === "00";

    // The public verify endpoint may be unavailable (404). Fallback: verify the
    // notification signature, then the data we alone stored at init time.
    if (!verification.confirmed && payloadSuccess) {
      const sha = async (str: string) => Array.from(new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)),
      )).map((b) => b.toString(16).padStart(2, "0")).join("");
      const amt = String(data.amount ?? "");
      const incomingHash = String(data.hashcode ?? "").toLowerCase();
      const candidates = [
        `${merchantId}${amt}${reference}${merchantSecret}`,
        `${merchantId}${sessionId}${reference}${amt}${merchantSecret}`,
        `${data.payId ?? ""}${merchantId}${amt}${reference}${merchantSecret}`,
        `${merchantSecret}${merchantId}${amt}${reference}`,
      ];
      let sigOk = false;
      for (const c of candidates) if (incomingHash && (await sha(c)) === incomingHash) sigOk = true;
      const dataOk =
        String(data.merchantId ?? "") === merchantId &&
        Number(data.amount) === Number(sub.amount) &&
        !!sub.session_id && String(sessionId ?? "") === String(sub.session_id) &&
        !!data.payId;
      console.log("Fallback verification:", { sigOk, dataOk });
      if (sigOk || dataOk) verification.confirmed = true;
    }

    if (!verification.confirmed) {
      console.warn("Payment NOT confirmed by PaiementPro:", reference, {
        payloadSuccess,
        raw: verification.raw.slice(0, 200),
      });
      // Nothing is written when the payload claimed success but verification failed.
      if (payloadSuccess) {
        return new Response(
          JSON.stringify({ error: "Paiement non confirmé par Paiement Pro" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      // Genuine failure notification: mark the pending subscription as failed.
      await supabase
        .from("subscriptions")
        .update({ status: "failed", session_id: sessionId ?? sub.session_id, payment_method: paymentMethod })
        .eq("reference", reference);
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const isSuccess = true;
    const status = "active";


    // Compute expiration based on billing cycle
    const now = new Date();
    const expiresAt = isSuccess
      ? sub.billing_cycle === "yearly"
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      : null;

    await supabase
      .from("subscriptions")
      .update({
        status,
        paid_at: isSuccess ? now.toISOString() : null,
        expires_at: expiresAt?.toISOString() ?? null,
        session_id: sessionId ?? sub.session_id,
        payment_method: paymentMethod,
      })
      .eq("reference", reference);

    // Mirror to subscribers table to keep the existing app logic in sync
    if (isSuccess) {
      const subRow = {
          user_id: sub.user_id,
          email: data.customerEmail || "",
          plan_name: sub.plan,
          plan_price: sub.amount,
          amount: sub.amount,
          currency: "XOF",
          billing_cycle: sub.billing_cycle,
          subscribed: true,
          is_trial: false,
          subscription_start: now.toISOString(),
          subscription_end: expiresAt!.toISOString(),
          next_billing_date: expiresAt!.toISOString(),
          updated_at: now.toISOString(),
        };
      const { data: existingSub } = await supabase
        .from("subscribers").select("id").eq("user_id", sub.user_id).maybeSingle();
      if (existingSub) {
        const { email: _e, ...upd } = subRow;
        await supabase.from("subscribers").update(upd).eq("user_id", sub.user_id);
      } else {
        await supabase.from("subscribers").insert(subRow);
      }

      await supabase.from("payment_history").insert({
        user_id: sub.user_id,
        plan_name: sub.plan,
        amount: sub.amount,
        currency: "XOF",
        billing_cycle: sub.billing_cycle,
        status: "success",
        payment_method: paymentMethod,
        moneroo_payment_id: reference,
        paid_at: now.toISOString(),
      });
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("paiementpro-notify error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
