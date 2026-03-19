import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.stocknix.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, confirmationUrl }: ConfirmationEmailRequest = await req.json();

    console.log(`Email de bienvenue pour: ${email}`);

    // Configuration Resend - plus fiable que SMTP
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    if (!Deno.env.get("RESEND_API_KEY")) {
      throw new Error("RESEND_API_KEY non configurée");
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Nouvel utilisateur';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmez votre compte Stocknix</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Confirmez votre compte Stocknix</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${fullName} !</h2>
            <p>Merci de vous être inscrit sur Stocknix ! Pour finaliser la création de votre compte, vous devez confirmer votre adresse email.</p>
            
            <div class="warning">
              <strong>⚠️ Action requise :</strong>
              <p>Vous avez reçu un email de confirmation de Supabase. Cliquez sur le lien dans cet email pour activer votre compte.</p>
            </div>
            
            <p><strong>Une fois votre compte confirmé, vous pourrez :</strong></p>
            <ul>
              <li>📦 Gérer votre stock et inventaire</li>
              <li>💰 Suivre vos ventes et revenus</li>
              <li>📊 Générer des rapports détaillés</li>
              <li>💳 Gérer les paiements clients</li>
            </ul>
            
            <p>Après confirmation, cliquez sur le bouton ci-dessous pour accéder à votre dashboard :</p>
            <a href="${confirmationUrl}" class="button">Accéder à mon dashboard</a>
            
            <div class="warning">
              <strong>Problème avec la confirmation ?</strong>
              <p>Si vous ne trouvez pas l'email de confirmation, vérifiez votre dossier spam/indésirables. L'email provient de Supabase.</p>
            </div>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par Stocknix<br>
            Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "Stocknix <onboarding@resend.dev>",
      to: [email],
      subject: `✉️ Confirmez votre compte Stocknix, ${fullName} !`,
      html: htmlContent,
    });

    if (emailError) {
      throw new Error(`Erreur Resend: ${emailError.message}`);
    }

    console.log(`Email de confirmation envoyé avec succès à ${email}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Email de confirmation envoyé avec succès" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);