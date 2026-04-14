import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    // Input validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Données invalides", success: false }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!code || !/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: "Code de réinitialisation invalide", success: false }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!newPassword || newPassword.length < 6 || newPassword.length > 128) {
      return new Response(
        JSON.stringify({ error: "Le mot de passe doit contenir entre 6 et 128 caractères", success: false }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Rate limiting: max 5 verification attempts per email per 15 minutes
    const { count } = await supabase
      .from('rate_limit_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', email)
      .eq('action_type', 'verify_reset')
      .gte('attempted_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

    if ((count || 0) >= 5) {
      return new Response(
        JSON.stringify({ error: "Trop de tentatives. Veuillez réessayer dans 15 minutes.", success: false }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Record attempt
    await supabase.from('rate_limit_attempts').insert({
      identifier: email, action_type: 'verify_reset'
    });

    // Verify the reset code
    const { data: resetCodeData, error: codeError } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (codeError || !resetCodeData) {
      return new Response(
        JSON.stringify({ error: "Code de réinitialisation invalide ou expiré", success: false }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      return new Response(
        JSON.stringify({ error: "Erreur interne", success: false }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const user = userData.users.find(u => u.email === email);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Code de réinitialisation invalide ou expiré", success: false }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id, { password: newPassword }
    );

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Erreur lors de la mise à jour du mot de passe", success: false }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark code as used
    await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', resetCodeData.id);

    return new Response(JSON.stringify({
      success: true,
      message: "Mot de passe réinitialisé avec succès"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in reset-password function");
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur", success: false }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
