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

    const { reference, email, firstName, lastName, password } = await req.json();
    if (!reference || !email || !firstName || !lastName || !password) {
      throw new Error("Reference, email, firstName, lastName and password are required");
    }
    logStep("Processing payment", { reference, email, firstName, lastName });

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

    // Create user account in Supabase Auth with email confirmation
    const { data: authUser, error: signUpError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: false, // User needs to confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (signUpError) {
      // Check if user already exists
      if (signUpError.message?.includes('already registered')) {
        logStep("User already exists, proceeding with subscription update");
        const { data: users } = await supabaseClient.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === email);
        if (!existingUser) throw new Error("User exists but cannot be found");
        
        // Update existing user subscription
        await updateSubscription(supabaseClient, existingUser.id, email, transaction);
        logStep("Existing user subscription updated");
        
        return new Response(JSON.stringify({
          success: true,
          message: "Subscription updated for existing user",
          user_exists: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      throw signUpError;
    }

    if (!authUser.user) throw new Error("Failed to create user");
    
    logStep("User created successfully", { userId: authUser.user.id });

    // Send confirmation email
    const { error: emailError } = await supabaseClient.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/auth/confirm`
      }
    });

    if (emailError) {
      logStep("Email confirmation error", { error: emailError });
      // Continue anyway, user can request new confirmation later
    } else {
      logStep("Confirmation email sent");
    }

    // Update subscription record
    await updateSubscription(supabaseClient, authUser.user.id, email, transaction);

    logStep("Subscription record updated", { userId: authUser.user.id });

    return new Response(JSON.stringify({
      success: true,
      message: "Payment processed successfully, confirmation email sent",
      user_created: true,
      needs_email_confirmation: true
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

// Helper function to update subscription
async function updateSubscription(supabaseClient: any, userId: string, email: string, transaction: any) {
  const subscriptionEnd = new Date();
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

  await supabaseClient
    .from("subscribers")
    .upsert({
      user_id: userId,
      email: email,
      paystack_customer_code: transaction.customer.customer_code,
      subscribed: true,
      subscription_end: subscriptionEnd.toISOString(),
      amount: 9999,
      currency: "XOF",
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
}