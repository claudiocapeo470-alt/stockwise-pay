import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLAN_PRICES: Record<string, number> = {
  starter: 9900,
  business: 24900,
  pro: 49900,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { plan, billing, user_id } = await req.json();

    if (!plan || !billing || !user_id) {
      return new Response(JSON.stringify({ error: 'plan, billing, user_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const basePrice = PLAN_PRICES[plan];
    if (!basePrice) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const amount = billing === 'annual' ? Math.round(basePrice * 12 * 0.8) : basePrice;

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('user_id', user_id)
      .maybeSingle();

    const siteUrl = Deno.env.get('SITE_URL') || 'https://stocknix.lovable.app';

    const monerooResponse = await fetch('https://api.moneroo.io/v1/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('MONEROO_SECRET_KEY')}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'XOF',
        description: `Abonnement Stocknix ${plan.toUpperCase()} - ${billing === 'monthly' ? 'Mensuel' : 'Annuel'}`,
        customer: {
          email: profile?.email || 'client@stocknix.app',
          first_name: profile?.first_name || 'Client',
          last_name: profile?.last_name || 'Stocknix',
        },
        return_url: `${siteUrl}/app/subscription-callback?plan=${plan}&billing=${billing}`,
        metadata: {
          user_id,
          plan,
          billing,
          source: 'stocknix_subscription',
        },
      }),
    });

    const monerooData = await monerooResponse.json();

    if (!monerooResponse.ok) {
      console.error('Moneroo error:', monerooData);
      return new Response(JSON.stringify({ error: 'Payment initialization failed', details: monerooData }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Save pending payment reference
    await supabaseAdmin.from('subscribers')
      .update({ moneroo_payment_id: monerooData.data?.id })
      .eq('user_id', user_id);

    return new Response(JSON.stringify({
      checkout_url: monerooData.data?.checkout_url,
      payment_id: monerooData.data?.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('moneroo-init-payment error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
