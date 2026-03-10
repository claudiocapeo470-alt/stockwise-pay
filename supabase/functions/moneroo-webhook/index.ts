import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Always return 200 to Moneroo
  try {
    if (req.method !== 'POST') {
      return new Response('OK', { status: 200 });
    }

    const body = await req.json();
    const event = body.event;
    const paymentData = body.data;

    console.log('Moneroo webhook received:', event, paymentData?.id);

    if (event !== 'payment.success') {
      console.log('Non-success event, ignoring:', event);
      return new Response('OK', { status: 200 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify payment with Moneroo
    const verifyResponse = await fetch(`https://api.moneroo.io/v1/payments/${paymentData.id}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MONEROO_SECRET_KEY')}`,
        'Accept': 'application/json',
      },
    });

    const verifyData = await verifyResponse.json();
    const payment = verifyData.data;

    if (payment?.status !== 'success') {
      console.log('Payment not confirmed as success:', payment?.status);
      return new Response('OK', { status: 200 });
    }

    const metadata = payment.metadata || {};
    const userId = metadata.user_id;
    const plan = metadata.plan;
    const billing = metadata.billing || 'monthly';

    if (!userId || !plan) {
      console.error('Missing metadata:', metadata);
      return new Response('OK', { status: 200 });
    }

    const now = new Date();
    const subscriptionEnd = new Date(now);
    if (billing === 'annual') {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
    }

    // Update subscriber
    const { error: updateError } = await supabaseAdmin.from('subscribers').update({
      subscribed: true,
      plan_name: plan,
      plan_price: payment.amount,
      billing_cycle: billing,
      is_trial: false,
      subscription_start: now.toISOString(),
      subscription_end: subscriptionEnd.toISOString(),
      next_billing_date: subscriptionEnd.toISOString(),
      moneroo_payment_id: payment.id,
      amount: payment.amount,
      updated_at: now.toISOString(),
    }).eq('user_id', userId);

    if (updateError) {
      console.error('Error updating subscriber:', updateError);
    }

    // Record in payment_history
    await supabaseAdmin.from('payment_history').insert({
      user_id: userId,
      moneroo_payment_id: payment.id,
      plan_name: plan,
      amount: payment.amount,
      currency: 'XOF',
      billing_cycle: billing,
      status: 'success',
      payment_method: payment.payment_method || 'mobile_money',
      paid_at: now.toISOString(),
    });

    console.log('Subscription activated for user:', userId, 'plan:', plan);
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('OK', { status: 200 });
  }
});
