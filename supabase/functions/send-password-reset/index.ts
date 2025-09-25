import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

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

    // Pour le moment, on simule l'envoi d'email et on affiche le code dans les logs
    console.log(`CODE DE RÉINITIALISATION POUR ${email}: ${resetCode}`);
    console.log("Vérifiez les logs du serveur pour récupérer votre code de réinitialisation");

    return new Response(JSON.stringify({ 
      success: true,
      message: "Code de réinitialisation généré avec succès. Vérifiez les logs du serveur pour le récupérer.",
      // En développement, on peut renvoyer le code directement
      resetCode: resetCode
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