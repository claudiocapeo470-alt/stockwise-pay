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

    const { userId, email, firstName, lastName, companyName } = await req.json();

    if (!userId) {
      throw new Error('userId est requis');
    }

    // Mettre à jour l'email si fourni
    if (email) {
      const { error: emailError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { email }
      );

      if (emailError) {
        console.error('Erreur lors de la mise à jour de l\'email:', emailError);
        throw new Error('Erreur lors de la mise à jour de l\'email');
      }
    }

    // Mettre à jour le profil
    const updateData: any = {};
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (companyName !== undefined) updateData.company_name = companyName;
    if (email !== undefined) updateData.email = email;

    if (Object.keys(updateData).length > 0) {
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (profileError) {
        console.error('Erreur lors de la mise à jour du profil:', profileError);
        throw new Error('Erreur lors de la mise à jour du profil');
      }
    }

    console.log(`Profil de l'utilisateur ${userId} mis à jour par l'admin ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Utilisateur mis à jour avec succès' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Erreur dans admin-update-user:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
