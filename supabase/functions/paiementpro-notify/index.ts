import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Public webhook called by Paiement Pro after payment.
// No JWT — verified via reference + Paiement Pro verify endpoint.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Paiement Pro can POST as form-data or JSON depending on config.
    let data: Record<string, any> = {};
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await req.json();
    } else {
      const form = await req.formData();
      form.forEach((v, k) => {
        data[k] = v.toString();
      });
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

    const isSuccess = responsecode === "0" || responsecode === "00";
    const status = isSuccess ? "active" : "failed";

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
      await supabase.from("subscribers").upsert(
        {
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
        },
        { onConflict: "user_id" }
      );

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
