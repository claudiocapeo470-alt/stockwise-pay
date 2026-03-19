import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.stocknix.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Pas d\'autorisation');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier que l'utilisateur est admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error('Accès refusé : vous devez être administrateur');
    }

    const { userId, status } = await req.json();

    if (!userId || !status) {
      throw new Error('userId et status sont requis');
    }

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      throw new Error('Status invalide');
    }

    // Mettre à jour le statut du compte
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ account_status: status })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du statut:', updateError);
      throw new Error('Erreur lors de la mise à jour du statut');
    }

    console.log(`Statut du compte ${userId} changé en ${status} par l'admin ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Statut mis à jour avec succès' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Erreur dans admin-toggle-user-status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
