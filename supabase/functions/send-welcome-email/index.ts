import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName?: string;
  lastName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName }: WelcomeEmailRequest = await req.json();

    console.log(`Email de bienvenue après confirmation pour: ${email}`);

    // Configuration SMTP
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOST") || "",
        port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
        tls: true,
        auth: {
          username: Deno.env.get("SMTP_USER") || "",
          password: Deno.env.get("SMTP_PASSWORD") || "",
        },
      },
    });

    if (!Deno.env.get("SMTP_HOST") || !Deno.env.get("SMTP_USER") || !Deno.env.get("SMTP_PASSWORD")) {
      throw new Error("Configuration SMTP incomplète");
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Utilisateur';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenue sur Stocknix - Compte confirmé !</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 5px; color: #155724; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue sur Stocknix !</h1>
          </div>
          <div class="content">
            <h2>Félicitations ${fullName} !</h2>
            
            <div class="success-box">
              <strong>✅ Votre compte est maintenant actif !</strong>
              <p>Votre adresse email a été confirmée avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de Stocknix.</p>
            </div>
            
            <p>Stocknix est votre solution complète de gestion d'entreprise qui vous permet de :</p>
            <ul>
              <li>📦 <strong>Gérer votre stock et inventaire</strong> - Suivez vos produits en temps réel</li>
              <li>💰 <strong>Suivre vos ventes et revenus</strong> - Analysez vos performances</li>
              <li>📊 <strong>Générer des rapports détaillés</strong> - Obtenez des insights précieux</li>
              <li>💳 <strong>Gérer les paiements clients</strong> - Simplifiez votre facturation</li>
            </ul>
            
            <p><strong>Prêt à commencer ?</strong> Connectez-vous dès maintenant à votre dashboard :</p>
            <a href="${Deno.env.get("SITE_URL") || "https://gestionpro.lovable.app"}/auth" class="button">Se connecter à Stocknix</a>
            
            <div class="success-box">
              <strong>💡 Conseil :</strong>
              <p>Explorez d'abord la section "Stocks" pour ajouter vos premiers produits, puis créez vos premières ventes dans la section "Ventes".</p>
            </div>
          </div>
          <div class="footer">
            <p>Merci de faire confiance à Stocknix pour votre gestion d'entreprise !<br>
            Notre équipe est là pour vous accompagner dans votre réussite.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await client.send({
      from: "Stocknix <support@ulrichdeschampkossonou.online>",
      to: email,
      subject: `🎉 Votre compte Stocknix est maintenant actif, ${fullName} !`,
      content: htmlContent,
      html: htmlContent,
    });

    await client.close();

    console.log(`Email de bienvenue après confirmation envoyé avec succès à ${email}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Email de bienvenue envoyé avec succès" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
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