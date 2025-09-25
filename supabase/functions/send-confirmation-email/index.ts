import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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

    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Nouvel utilisateur';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenue sur Stocknix</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue sur Stocknix !</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${fullName} !</h2>
            <p>Félicitations ! Votre compte Stocknix a été créé avec succès.</p>
            <p>Stocknix est votre solution complète de gestion d'entreprise qui vous permet de :</p>
            <ul>
              <li>📦 Gérer votre stock et inventaire</li>
              <li>💰 Suivre vos ventes et revenus</li>
              <li>📊 Générer des rapports détaillés</li>
              <li>💳 Gérer les paiements clients</li>
            </ul>
            <p>Cliquez sur le bouton ci-dessous pour accéder à votre dashboard :</p>
            <a href="${confirmationUrl}" class="button">Accéder à mon dashboard</a>
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${confirmationUrl}">${confirmationUrl}</a></p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par Stocknix<br>
            Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await client.send({
      from: "Stocknix <support@ulrichdeschampkossonou.online>",
      to: email,
      subject: `🎉 Bienvenue sur Stocknix, ${fullName} !`,
      content: htmlContent,
      html: htmlContent,
    });

    await client.close();

    console.log(`Email de bienvenue envoyé avec succès à ${email}`);

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