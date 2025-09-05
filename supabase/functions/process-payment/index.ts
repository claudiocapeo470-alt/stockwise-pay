import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-PAYMENT] ${step}${detailsStr}`);
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

    const { reference, email } = await req.json();
    if (!reference || !email) throw new Error("Reference and email are required");
    logStep("Processing payment", { reference, email });

    // Verify transaction with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          "Authorization": `Bearer ${paystackKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyResponse.json();
    if (!verifyData.status) throw new Error(`Payment verification failed: ${verifyData.message}`);
    
    const transaction = verifyData.data;
    if (transaction.status !== "success") {
      throw new Error(`Payment not successful: ${transaction.status}`);
    }

    logStep("Payment verified successfully", { status: transaction.status, amount: transaction.amount });

    // Get user from auth
    const { data: users } = await supabaseClient.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    
    if (!user) throw new Error("User not found");

    // Calculate subscription end date (1 month from now)
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    // Update subscriber record
    await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: user.id,
        email: email,
        paystack_customer_code: transaction.customer.customer_code,
        subscribed: true,
        subscription_end: subscriptionEnd.toISOString(),
        amount: 9999,
        currency: "XOF",
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    logStep("Subscription record updated", { userId: user.id, subscriptionEnd });

    return new Response(JSON.stringify({
      success: true,
      message: "Payment processed successfully",
      subscription_end: subscriptionEnd.toISOString(),
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