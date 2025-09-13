import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`Sending password reset email to: ${email} with code: ${resetCode}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Store the reset code in the database
    const { error: dbError } = await supabase
      .from('password_reset_codes')
      .insert({
        email: email,
        code: resetCode,
      });

    if (dbError) {
      console.error("Error storing reset code:", dbError);
      throw new Error("Erreur lors de la génération du code de réinitialisation");
    }

    const emailResponse = await resend.emails.send({
      from: "Stocknix <noreply@resend.dev>",
      to: [email],
      subject: "Réinitialisation de votre mot de passe - Stocknix",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation de mot de passe</title>
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
            .code-box { 
              background: #f8fafc; 
              border: 2px solid #e2e8f0; 
              border-radius: 8px; 
              padding: 20px; 
              text-align: center; 
              margin: 30px 0; 
            }
            .code { 
              font-size: 32px; 
              font-weight: bold; 
              color: #667eea; 
              letter-spacing: 4px; 
              font-family: 'Courier New', monospace;
            }
            .footer { 
              background: #f8fafc; 
              padding: 20px 30px; 
              text-align: center; 
              font-size: 14px; 
              color: #64748b; 
            }
            .warning { 
              background: #fef3c7; 
              border-left: 4px solid #f59e0b; 
              padding: 15px; 
              margin: 20px 0; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Stocknix</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                Réinitialisation de votre mot de passe
              </p>
            </div>
            
            <div class="content">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Bonjour,</h2>
              
              <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Stocknix.</p>
              
              <p>Voici votre code de vérification :</p>
              
              <div class="code-box">
                <div class="code">${resetCode}</div>
                <p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px;">
                  Saisissez ce code dans l'application
                </p>
              </div>
              
              <div class="warning">
                <p style="margin: 0; color: #92400e;">
                  <strong>⚠️ Important :</strong> Ce code expire dans <strong>15 minutes</strong> pour votre sécurité.
                </p>
              </div>
              
              <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
              
              <p style="margin-top: 30px;">
                Cordialement,<br>
                <strong>L'équipe Stocknix</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                © 2024 Stocknix - Gestion complète pour PME/TPE
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Email de réinitialisation envoyé avec succès" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
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