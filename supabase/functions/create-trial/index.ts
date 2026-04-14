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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, email } = await req.json();

    if (!user_id || !email) {
      return new Response(JSON.stringify({ error: 'user_id and email required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 15);

    // Check if subscriber already exists
    const { data: existing } = await supabaseAdmin
      .from('subscribers')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, message: 'Trial already exists' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { error } = await supabaseAdmin.from('subscribers').insert({
      user_id,
      email,
      subscribed: true,
      amount: 0,
      currency: 'XOF',
      subscription_end: trialEnd.toISOString(),
      plan_name: 'trial',
      plan_price: 0,
      trial_ends_at: trialEnd.toISOString(),
      is_trial: true,
      subscription_start: new Date().toISOString(),
    });

    if (error) {
      console.error('Error creating trial:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('create-trial error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
