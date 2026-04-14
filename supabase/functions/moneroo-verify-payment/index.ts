import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { payment_id } = await req.json();

    if (!payment_id) {
      return new Response(JSON.stringify({ error: 'payment_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const verifyResponse = await fetch(`https://api.moneroo.io/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MONEROO_SECRET_KEY')}`,
        'Accept': 'application/json',
      },
    });

    const verifyData = await verifyResponse.json();
    const payment = verifyData.data;

    if (!payment) {
      return new Response(JSON.stringify({ status: 'not_found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If success and not yet processed, update subscriber (backup for webhook delay)
    if (payment.status === 'success' && payment.metadata?.user_id) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const metadata = payment.metadata;
      const billing = metadata.billing || 'monthly';
      const now = new Date();
      const subscriptionEnd = new Date(now);
      if (billing === 'annual') {
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
      } else {
        subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
      }

      await supabaseAdmin.from('subscribers').update({
        subscribed: true,
        plan_name: metadata.plan,
        plan_price: payment.amount,
        billing_cycle: billing,
        is_trial: false,
        subscription_start: now.toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        next_billing_date: subscriptionEnd.toISOString(),
        moneroo_payment_id: payment.id,
        amount: payment.amount,
        updated_at: now.toISOString(),
      }).eq('user_id', metadata.user_id);

      // Insert payment history if not exists
      const { data: existing } = await supabaseAdmin
        .from('payment_history')
        .select('id')
        .eq('moneroo_payment_id', payment.id)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from('payment_history').insert({
          user_id: metadata.user_id,
          moneroo_payment_id: payment.id,
          plan_name: metadata.plan,
          amount: payment.amount,
          currency: 'XOF',
          billing_cycle: billing,
          status: 'success',
          payment_method: payment.payment_method || 'mobile_money',
          paid_at: now.toISOString(),
        });
      }
    }

    return new Response(JSON.stringify({
      status: payment.status === 'success' ? 'success' : payment.status === 'failed' ? 'failed' : 'pending',
      plan: payment.metadata?.plan,
      billing: payment.metadata?.billing,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('moneroo-verify-payment error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
