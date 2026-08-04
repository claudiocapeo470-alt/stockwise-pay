import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Pas d'autorisation");

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) throw new Error('Utilisateur non authentifié');

    const { data: roleData } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) throw new Error('Accès refusé : vous devez être administrateur');

    const body = await req.json();
    const action: string = body?.action;
    const siteUrl = Deno.env.get('SITE_URL') || 'https://www.stocknix.com';

    const isEmail = (e: unknown) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    if (action === 'create') {
      const { email, password, firstName, lastName, companyName } = body;
      if (!isEmail(email)) throw new Error('Email invalide');
      if (typeof password !== 'string' || password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name: firstName ?? null, last_name: lastName ?? null },
      });
      if (error) throw new Error(error.message);

      await admin.from('profiles').update({
        first_name: firstName ?? null,
        last_name: lastName ?? null,
        company_name: companyName ?? null,
        email,
      }).eq('user_id', created.user!.id);

      return json({ success: true, user_id: created.user!.id, message: 'Utilisateur créé' });
    }

    if (action === 'invite') {
      const { email, firstName, lastName, companyName } = body;
      if (!isEmail(email)) throw new Error('Email invalide');

      const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/auth`,
        data: { first_name: firstName ?? null, last_name: lastName ?? null },
      });
      if (error) throw new Error(error.message);

      if (invited?.user?.id) {
        await admin.from('profiles').update({
          first_name: firstName ?? null,
          last_name: lastName ?? null,
          company_name: companyName ?? null,
          email,
        }).eq('user_id', invited.user.id);
      }

      return json({ success: true, message: 'Invitation envoyée' });
    }

    if (action === 'set_password') {
      const { userId, password } = body;
      if (!userId) throw new Error('userId est requis');
      if (typeof password !== 'string' || password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) throw new Error(error.message);
      return json({ success: true, message: 'Mot de passe mis à jour' });
    }

    throw new Error('Action inconnue');
  } catch (error) {
    console.error('admin-manage-user:', error);
    return json({ error: (error as Error).message }, 400);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}
