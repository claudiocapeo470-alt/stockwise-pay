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

    if (!merchantId) {
      return new Response(
        JSON.stringify({ error: "PAIEMENTPRO_MERCHANT_ID non configuré" }),
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

    const ppPayload = {
      merchantId,
      amount: body.amount,
      referenceNumber: reference,
      customerEmail: body.email,
      customerFirstName: body.firstName,
      customerLastName: body.lastName || "",
      customerPhoneNumber: body.phone || "",
      notificationURL: notifyUrl,
      returnURL: returnUrl,
      currency: "XOF",
      countryCurrencyCode: "952",
    };

    const ppRes = await fetch(
      "https://www.paiementpro.net/webservice/onlinepayment/init.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ppPayload),
      }
    );

    const ppData = await ppRes.json().catch(() => null);
    console.log("Paiement Pro response:", ppData);

    if (!ppData || (ppData.responsecode !== "0" && ppData.responsecode !== 0)) {
      await supabase
        .from("subscriptions")
        .update({ status: "failed" })
        .eq("reference", reference);
      return new Response(
        JSON.stringify({
          error: ppData?.responsemsg || "Échec initialisation paiement",
          details: ppData,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionId = ppData.sessionid;
    await supabase
      .from("subscriptions")
      .update({ session_id: sessionId })
      .eq("reference", reference);

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
