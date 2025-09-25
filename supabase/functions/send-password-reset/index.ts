import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

    console.log(`Generating password reset code for: ${email} - Code: ${resetCode}`);

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

    // Configuration SMTP et envoi d'email
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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Réinitialisation de votre mot de passe Stocknix</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; }
          .code-box { background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .code { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 3px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <h2>Demande de réinitialisation</h2>
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Stocknix.</p>
            <p>Utilisez le code ci-dessous pour créer un nouveau mot de passe :</p>
            <div class="code-box">
              <div class="code">${resetCode}</div>
            </div>
            <div class="warning">
              <strong>⚠️ Important :</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Ce code expire dans <strong>15 minutes</strong></li>
                <li>Il ne peut être utilisé qu'une seule fois</li>
                <li>Gardez ce code confidentiel</li>
              </ul>
            </div>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par Stocknix<br>
            Pour votre sécurité, ne partagez jamais ce code avec quelqu'un d'autre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await client.send({
      from: "Stocknix <support@ulrichdeschampkossonou.online>",
      to: email,
      subject: "🔐 Code de réinitialisation de mot de passe - Stocknix",
      content: htmlContent,
      html: htmlContent,
    });

    await client.close();

    console.log(`Email de réinitialisation envoyé avec succès à ${email}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Code de réinitialisation envoyé par email avec succès."
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