import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) throw new Error("PAYSTACK_SECRET_KEY is not set");
    logStep("Paystack key verified");

    const { email, firstName, lastName } = await req.json();
    if (!email) throw new Error("Email is required");
    logStep("Request data received", { email, firstName, lastName });

    // Create customer on Paystack
    const customerResponse = await fetch("https://api.paystack.co/customer", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    const customerData = await customerResponse.json();
    if (!customerData.status) throw new Error(`Paystack customer creation failed: ${customerData.message}`);
    
    const customerCode = customerData.data.customer_code;
    logStep("Paystack customer created", { customerCode });

    // Initialize one-time payment for subscription (9999 FCFA)
    const subscriptionResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: 999900, // 9999 FCFA in kobo (9999 * 100)
        currency: "XOF",
        callback_url: `${req.headers.get("origin")}/auth?payment=success`,
        cancel_url: `${req.headers.get("origin")}/auth?payment=cancelled`,
        metadata: {
          subscription_type: "monthly",
          amount_fcfa: 9999,
          customer_code: customerCode,
          purpose: "monthly_subscription_payment",
        },
      }),
    });

    const subscriptionData = await subscriptionResponse.json();
    if (!subscriptionData.status) throw new Error(`Paystack subscription failed: ${subscriptionData.message}`);

    logStep("Paystack subscription initialized", { reference: subscriptionData.data.reference });

    return new Response(JSON.stringify({
      success: true,
      authorization_url: subscriptionData.data.authorization_url,
      reference: subscriptionData.data.reference,
      customer_code: customerCode,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});