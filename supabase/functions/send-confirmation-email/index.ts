import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    console.log(`Sending confirmation email to: ${email}`);

    const displayName = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : firstName || email.split('@')[0];

    const emailResponse = await resend.emails.send({
      from: "Stocknix <noreply@resend.dev>",
      to: [email],
      subject: "Bienvenue sur Stocknix - Confirmez votre compte",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur Stocknix</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 12px; 
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              color: white; 
              margin: 0; 
              font-size: 28px; 
              font-weight: 700;
            }
            .content { 
              padding: 40px 30px; 
            }
            .cta-button { 
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 16px 32px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold; 
              font-size: 16px;
              margin: 20px 0;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
              transition: transform 0.2s ease;
            }
            .cta-button:hover {
              transform: translateY(-2px);
            }
            .footer { 
              background: #f8fafc; 
              padding: 20px 30px; 
              text-align: center; 
              font-size: 14px; 
              color: #64748b; 
            }
            .features { 
              background: #f8fafc; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
            }
            .features ul { 
              margin: 0; 
              padding-left: 20px; 
            }
            .features li { 
              margin: 8px 0; 
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Bienvenue sur Stocknix</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                Votre solution de gestion complète
              </p>
            </div>
            
            <div class="content">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Bonjour ${displayName} !</h2>
              
              <p>Félicitations ! Votre compte Stocknix a été créé avec succès. Pour commencer à utiliser la plateforme, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" class="cta-button" style="color: white;">
                  ✅ Confirmer mon compte
                </a>
              </div>
              
              <div class="features">
                <h3 style="color: #1e293b; margin-top: 0;">Ce que vous pourrez faire avec Stocknix :</h3>
                <ul>
                  <li>📦 Gérer votre stock en temps réel</li>
                  <li>💰 Suivre vos ventes et paiements</li>
                  <li>📊 Analyser vos performances</li>
                  <li>📱 Accéder à votre dashboard partout</li>
                  <li>🔒 Sécuriser vos données</li>
                </ul>
              </div>
              
              <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
              <p style="background: #f1f5f9; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 12px;">
                ${confirmationUrl}
              </p>
              
              <p style="margin-top: 30px;">
                L'équipe Stocknix est là pour vous accompagner dans la croissance de votre entreprise !
              </p>
              
              <p style="margin-top: 30px;">
                À très bientôt,<br>
                <strong>L'équipe Stocknix</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>
                Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.<br>
                © 2024 Stocknix - Gestion complète pour PME/TPE
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("Error sending confirmation email:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("Confirmation email sent successfully:", emailResponse);

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
    console.error("Error in send-confirmation-email function:", error);
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