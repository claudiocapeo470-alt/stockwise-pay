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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
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
      return new Response(
        JSON.stringify({ error: "PAIEMENTPRO_MERCHANT_ID ou PAIEMENTPRO_SECRET_KEY non configuré" }),
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = (await req.json()) as InitPayload;

    // Basic validation
    if (
      !body.plan ||
      !["starter", "business", "pro"].includes(body.plan) ||
      !body.amount ||
      body.amount < 100 ||
      !body.email ||
      !body.firstName
    ) {
      return new Response(
        JSON.stringify({ error: "Paramètres invalides" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reference = `SUB_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Persist pending subscription
    const supabase = createClient(supabaseUrl, serviceKey);
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
        JSON.stringify({ error: "Erreur enregistrement abonnement" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Paiement Pro REST endpoint (SOAP wrapper)
    // Paiement Pro provides REST init endpoint which is friendlier than SOAP in Deno.
    const origin = req.headers.get("origin") ?? "https://www.stocknix.com";
    const notifyUrl = `${supabaseUrl}/functions/v1/paiementpro-notify`;
    const returnUrl = `${origin}/app/subscription?ref=${reference}`;

    // Generate SHA-256 hashcode (REQUIRED by Paiement Pro)
    const hashString = `${merchantId}${body.amount}${reference}${merchantSecret}`;
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(hashString)
    );
    const hashcode = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const ppForm = new URLSearchParams();
    ppForm.append("merchantId", merchantId);
    ppForm.append("amount", String(body.amount));
    ppForm.append("referenceNumber", reference);
    ppForm.append("customerEmail", body.email);
    ppForm.append("customerFirstName", body.firstName);
    ppForm.append("customerLastName", body.lastName || "");
    ppForm.append("customerPhoneNumber", body.phone || "0700000000");
    ppForm.append("notificationURL", notifyUrl);
    ppForm.append("returnURL", returnUrl);
    ppForm.append("currency", "XOF");
    ppForm.append("countryCurrencyCode", "952");
    ppForm.append("description", `Abonnement Stocknix ${body.plan}`);
    ppForm.append("hashcode", hashcode);
    ppForm.append("channel", "");

    console.log("Calling Paiement Pro with hashcode:", hashcode);
    console.log("Form data:", ppForm.toString());

    const ppRes = await fetch(
      "https://www.paiementpro.net/webservice/onlinepayment/init.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json, text/plain, */*",
        },
        body: ppForm.toString(),
      }
    );

    const ppText = await ppRes.text();
    console.log("Paiement Pro raw response:", ppText, "status:", ppRes.status);

    // Try multiple parsing strategies
    let sessionId: string | null = null;
    let ppData: any = null;

    // Strategy 1: JSON
    try {
      ppData = JSON.parse(ppText);
      if (ppData?.sessionid) sessionId = ppData.sessionid;
    } catch {
      // not JSON
    }

    // Strategy 2: regex match sessionid=XXX (URL or query-string format)
    if (!sessionId) {
      const m = ppText.match(/sessionid[=:"\s]+([a-zA-Z0-9_-]+)/i);
      if (m) sessionId = m[1];
    }

    // Strategy 3: raw sessionId text
    if (!sessionId && ppText && ppText.length < 200 && !ppText.includes("<") && !ppText.includes("{") && /^[a-zA-Z0-9_-]+$/.test(ppText.trim())) {
      sessionId = ppText.trim();
    }

    if (!sessionId) {
      await supabase
        .from("subscriptions")
        .update({ status: "failed" })
        .eq("reference", reference);
      return new Response(
        JSON.stringify({
          error: ppData?.responsemsg || ppData?.message || ppData?.decription || `Échec Paiement Pro: ${ppText.slice(0, 200)}`,
          details: ppData ?? ppText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    await supabase
      .from("subscriptions")
      .update({ session_id: sessionId })
      .eq("reference", reference);

    console.log("Success! sessionId:", sessionId);
    const paymentUrl = `https://www.paiementpro.net/webservice/onlinepayment/processing_v2.php?sessionid=${sessionId}`;

    return new Response(
      JSON.stringify({ payment_url: paymentUrl, reference, sessionId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("paiementpro-init error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
