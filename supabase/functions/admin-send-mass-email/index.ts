import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    const { subject, message, notificationType, specificEmail } = await req.json();

    if (!subject || !message || !notificationType) {
      throw new Error('Sujet, message et type sont requis');
    }

    let recipientEmails: string[] = [];

    // Récupérer les emails selon le type
    if (notificationType === 'all') {
      const { data: profiles } = await supabaseClient
        .from('profiles')
        .select('email')
        .not('email', 'is', null);
      
      recipientEmails = profiles?.map(p => p.email).filter(e => e) || [];
    } else if (notificationType === 'subscribed') {
      const { data: subscribers } = await supabaseClient
        .from('subscribers')
        .select('email')
        .eq('subscribed', true);
      
      recipientEmails = subscribers?.map(s => s.email) || [];
    } else if (notificationType === 'specific') {
      if (!specificEmail) {
        throw new Error('Email spécifique requis');
      }
      recipientEmails = [specificEmail];
    }

    if (recipientEmails.length === 0) {
      throw new Error('Aucun destinataire trouvé');
    }

    console.log(`Envoi d'emails à ${recipientEmails.length} destinataires`);

    // Envoyer les emails en lots de 50 pour éviter les limites
    const batchSize = 50;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < recipientEmails.length; i += batchSize) {
      const batch = recipientEmails.slice(i, i + batchSize);
      
      try {
        await resend.emails.send({
          from: "Stocknix <onboarding@resend.dev>",
          to: batch,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #DC2626;">${subject}</h2>
              <div style="margin: 20px 0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; font-size: 14px;">
                Ceci est un message automatique de Stocknix. Merci de ne pas répondre à cet email.
              </p>
            </div>
          `,
        });
        successCount += batch.length;
      } catch (error) {
        console.error(`Erreur d'envoi pour le lot ${i / batchSize + 1}:`, error);
        failureCount += batch.length;
      }
    }

    // Enregistrer dans l'historique
    await supabaseClient
      .from('email_history')
      .insert({
        subject,
        message,
        recipient_type: notificationType,
        recipient_email: notificationType === 'specific' ? specificEmail : null,
        sent_by: user.id,
        total_recipients: recipientEmails.length,
        status: failureCount === 0 ? 'sent' : (successCount === 0 ? 'failed' : 'sent')
      });

    console.log(`Emails envoyés: ${successCount} succès, ${failureCount} échecs`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${successCount} emails envoyés avec succès${failureCount > 0 ? `, ${failureCount} échecs` : ''}`,
        details: { successCount, failureCount, total: recipientEmails.length }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Erreur dans admin-send-mass-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
