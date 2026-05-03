import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InitPayload {
  plan: "starter" | "business" | "pro";
  billing_cycle: "monthly" | "yearly";
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const readPaiementProUrl = (raw: string) => {
  let paymentUrl: string | null = null;
  let sessionId: string | null = null;
  let ppData: any = null;

  try {
    ppData = JSON.parse(raw);
    paymentUrl = ppData?.url || ppData?.payment_url || ppData?.paymentUrl || ppData?.redirect_url || null;
    sessionId = ppData?.sessionid || ppData?.sessionId || ppData?.session_id || null;
  } catch {
    try {
      const params = new URLSearchParams(raw);
      paymentUrl = params.get("url") || params.get("payment_url") || params.get("redirect_url");
      sessionId = params.get("sessionid") || params.get("sessionId") || params.get("session_id");
    } catch { /* ignore */ }
  }

  if (!paymentUrl) {
    const urlMatch = raw.match(/https?:\/\/[^\s'"}]+/i);
    if (urlMatch) paymentUrl = urlMatch[0].replace(/\\\//g, "/");
  }

  if (!sessionId) {
    const sessionMatch = (paymentUrl || raw).match(/sessionid=([a-zA-Z0-9_-]+)/i);
    if (sessionMatch) sessionId = sessionMatch[1];
  }

  if (!paymentUrl && sessionId) {
    paymentUrl = `https://www.paiementpro.net/webservice/onlinepayment/processing_v2.php?sessionid=${sessionId}`;
  }

  return { paymentUrl, sessionId, ppData };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("paiementpro-init invoked", { method: req.method, origin: req.headers.get("origin") });
  let pendingReference: string | null = null;
  let adminClient: any = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.warn("Missing Authorization header");
      return new Response(JSON.stringify({ error: "Authentification requise" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const merchantId = Deno.env.get("PAIEMENTPRO_MERCHANT_ID");
    const merchantSecret = Deno.env.get("PAIEMENTPRO_SECRET_KEY");

    if (!merchantId || !merchantSecret) {
      console.error("Missing PaiementPro credentials", {
        hasMerchantId: !!merchantId,
        hasSecret: !!merchantSecret,
      });
      return new Response(
        JSON.stringify({ error: "Configuration du marchand manquante (contactez le support)" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth check via getUser (compatible all SDK versions)
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Session invalide — reconnectez-vous" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    console.log("Authenticated user:", userId);

    let body: InitPayload;
    try {
      body = (await req.json()) as InitPayload;
    } catch (e) {
      console.error("Invalid JSON body:", e);
      return new Response(
        JSON.stringify({ error: "Corps de requête invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic validation
    if (
      !body.plan ||
      !["starter", "business", "pro"].includes(body.plan) ||
      !body.amount ||
      body.amount < 100 ||
      !body.email ||
      !body.firstName
    ) {
      console.warn("Invalid params:", body);
      return new Response(
        JSON.stringify({ error: "Paramètres invalides", details: { plan: body.plan, amount: body.amount, hasEmail: !!body.email, hasFirstName: !!body.firstName } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    adminClient = supabase;
    await supabase
      .from("subscriptions")
      .update({ status: "failed" })
      .eq("user_id", userId)
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

    const reference = `SUB_${Date.now()}_${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    pendingReference = reference;

    // Persist pending subscription
    const { error: insertError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      reference,
      amount: body.amount,
      plan: body.plan,
      billing_cycle: body.billing_cycle ?? "monthly",
      status: "pending",
    });

    if (insertError) {
      console.error("Insert subscription error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erreur enregistrement abonnement", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const origin = req.headers.get("origin") ?? "https://www.stocknix.com";
    const notifyUrl = `${supabaseUrl}/functions/v1/paiementpro-notify`;
    const returnUrl = `${origin}/app/subscription?ref=${reference}`;

    // Generate SHA-256 hashcode (required by Paiement Pro merchant security)
    const hashString = `${merchantId}${body.amount}${reference}${merchantSecret}`;
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(hashString)
    );
    const hashcode = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const sanitizePhone = (phone?: string) => {
      const digits = String(phone || "").replace(/\D/g, "");
      return digits.length >= 8 ? digits.slice(-10) : "0700000000";
    };

    const paiementProPayload = {
      merchantId,
      amount: body.amount,
      description: `Abonnement Stocknix ${body.plan}`,
      channel: "CARD",
      countryCurrencyCode: "952",
      referenceNumber: reference,
      customerEmail: body.email,
      customerFirstName: body.firstName,
      customerLastname: body.lastName || body.firstName || "Client",
      customerPhoneNumber: sanitizePhone(body.phone),
      notificationURL: notifyUrl,
      returnURL: returnUrl,
      returnContext: reference,
    };

    const paiementProPayloadWithHash = { ...paiementProPayload, hashcode };

    const encodedPayload = (payload: Record<string, unknown>) => new URLSearchParams(
      Object.entries(payload).reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = String(value ?? "");
        return acc;
      }, {})
    );

    console.log("Calling Paiement Pro curl-init endpoint for reference:", reference);

    const attempts = [
      {
        label: "json-docs",
        headers: { "Content-Type": "application/json; charset=utf-8", "Accept": "application/json, text/plain, */*" },
        body: JSON.stringify(paiementProPayload),
      },
      {
        label: "json-hash",
        headers: { "Content-Type": "application/json; charset=utf-8", "Accept": "application/json, text/plain, */*" },
        body: JSON.stringify(paiementProPayloadWithHash),
      },
      {
        label: "form-docs",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json, text/plain, */*" },
        body: encodedPayload(paiementProPayload).toString(),
      },
      {
        label: "form-hash",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json, text/plain, */*" },
        body: encodedPayload(paiementProPayloadWithHash).toString(),
      },
    ];

    let paymentUrl: string | null = null;
    let sessionId: string | null = null;
    let ppData: any = null;
    let lastRaw = "";

    for (const attempt of attempts) {
      const ppRes = await fetch("https://www.paiementpro.net/webservice/onlinepayment/init/curl-init.php", {
        method: "POST",
        headers: attempt.headers,
        body: attempt.body,
      });
      lastRaw = await ppRes.text();
      console.log("PaiementPro response:", { attempt: attempt.label, status: ppRes.status, body: lastRaw.slice(0, 300) });
      const parsed = readPaiementProUrl(lastRaw);
      paymentUrl = parsed.paymentUrl;
      sessionId = parsed.sessionId;
      ppData = parsed.ppData;
      if (paymentUrl) break;
    }

    if (!paymentUrl) {
      await supabase
        .from("subscriptions")
        .update({ status: "failed" })
        .eq("reference", reference);
      return new Response(
        JSON.stringify({
          error: ppData?.message || ppData?.responsemsg || ppData?.description || ppData?.decription || `Échec Paiement Pro: ${lastRaw.slice(0, 200)}`,
          details: ppData ?? lastRaw,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("subscriptions")
      .update({ session_id: sessionId })
      .eq("reference", reference);

    console.log("Success! Paiement Pro URL generated for reference:", reference);

    return new Response(
      JSON.stringify({ payment_url: paymentUrl, reference, sessionId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("paiementpro-init error:", err);
    if (pendingReference && adminClient) {
      await adminClient.from("subscriptions").update({ status: "failed" }).eq("reference", pendingReference);
    }
    return new Response(
      JSON.stringify({ error: "Impossible de joindre Paiement Pro. Réessayez dans quelques instants.", details: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
