import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check existing subscription in database
    const { data: existingSubscription } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    logStep("Existing subscription found", existingSubscription);

    // If legacy user and still within grace period, allow access
    if (existingSubscription?.is_legacy_user && existingSubscription.subscription_end) {
      const subscriptionEnd = new Date(existingSubscription.subscription_end);
      const now = new Date();
      
      if (now < subscriptionEnd) {
        logStep("Legacy user within grace period");
        return new Response(JSON.stringify({
          subscribed: true,
          is_legacy: true,
          subscription_end: existingSubscription.subscription_end,
          grace_period: true,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // For non-legacy users or expired legacy users, verify with Paystack
    if (existingSubscription?.paystack_customer_code) {
      const customerResponse = await fetch(
        `https://api.paystack.co/customer/${existingSubscription.paystack_customer_code}`,
        {
          headers: {
            "Authorization": `Bearer ${paystackKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const customerData = await customerResponse.json();
      if (customerData.status && customerData.data.subscriptions?.length > 0) {
        const activeSubscription = customerData.data.subscriptions.find(
          (sub: any) => sub.status === "active"
        );

        if (activeSubscription) {
          const subscriptionEnd = new Date(activeSubscription.next_payment_date);
          
          // Update database
          await supabaseClient
            .from("subscribers")
            .upsert({
              user_id: user.id,
              email: user.email,
              paystack_customer_code: existingSubscription.paystack_customer_code,
              subscribed: true,
              subscription_code: activeSubscription.subscription_code,
              subscription_end: subscriptionEnd.toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

          logStep("Active subscription found and updated");
          return new Response(JSON.stringify({
            subscribed: true,
            subscription_end: subscriptionEnd.toISOString(),
            is_legacy: existingSubscription.is_legacy_user,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    }

    // No active subscription found
    await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: user.id,
        email: user.email,
        subscribed: false,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    logStep("No active subscription found");
    return new Response(JSON.stringify({
      subscribed: false,
      is_legacy: existingSubscription?.is_legacy_user || false,
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