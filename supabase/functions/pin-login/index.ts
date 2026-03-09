import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_code, pin_code } = await req.json();

    if (!company_code || !pin_code) {
      return new Response(
        JSON.stringify({ error: "Code entreprise et PIN requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/^\d{6}$/.test(company_code) || !/^\d{6}$/.test(pin_code)) {
      return new Response(
        JSON.stringify({ error: "Les codes doivent être des nombres de 6 chiffres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate PIN against DB
    const { data: members, error: validateError } = await supabaseAdmin.rpc(
      "validate_pin_login",
      { _company_code: company_code, _pin_code: pin_code }
    );

    if (validateError || !members || members.length === 0) {
      return new Response(
        JSON.stringify({ error: "Code entreprise ou PIN incorrect" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const member = members[0];
    let authUserId = member.auth_user_id;
    const memberEmail = `emp_${member.member_id.substring(0, 8)}@${company_code}.stocknix.app`;

    // Create auth user if not exists
    if (!authUserId) {
      const randomPassword = crypto.randomUUID() + "!Aa1";
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: memberEmail,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          first_name: member.member_first_name,
          last_name: member.member_last_name || "",
          is_employee: true,
          company_id: member.company_id,
          member_id: member.member_id,
          role_name: member.member_role_name,
        },
      });

      if (createError) {
        // User might already exist with this email
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === memberEmail);
        
        if (existingUser) {
          authUserId = existingUser.id;
        } else {
          console.error("Error creating auth user:", createError);
          return new Response(
            JSON.stringify({ error: "Erreur de création du compte employé" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        authUserId = newUser.user.id;
      }

      // Update member with auth_user_id
      await supabaseAdmin
        .from("company_members")
        .update({ auth_user_id: authUserId })
        .eq("id", member.member_id);
    } else {
      // Get the email of the existing auth user
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(authUserId);
      if (existingUser?.user?.email) {
        // Use existing email
      }
    }

    // Generate magic link for login
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: memberEmail,
    });

    if (linkError || !linkData) {
      console.error("Error generating magic link:", linkError);
      return new Response(
        JSON.stringify({ error: "Erreur de génération du lien de connexion" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract token from the action link
    const actionLink = linkData.properties?.action_link || "";
    const url = new URL(actionLink);
    const tokenHash = url.searchParams.get("token") || url.hash?.split("token=")[1]?.split("&")[0] || "";
    
    // Update last login
    await supabaseAdmin
      .from("company_members")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", member.member_id);

    return new Response(
      JSON.stringify({
        success: true,
        email: memberEmail,
        token_hash: linkData.properties?.hashed_token || tokenHash,
        member: {
          id: member.member_id,
          first_name: member.member_first_name,
          last_name: member.member_last_name,
          photo_url: member.member_photo_url,
          role_name: member.member_role_name,
          permissions: member.member_permissions,
          company_id: member.company_id,
          company_name: member.company_name,
          company_logo_url: member.company_logo_url,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PIN login error:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
