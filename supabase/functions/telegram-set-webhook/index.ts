// Installation unique : enregistre le webhook Telegram vers telegram-webhook.
// Protégé par la clé interne TELEGRAM_SETUP_KEY (en-tête x-setup-key).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-setup-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), {
      status,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });

  const setupKey = Deno.env.get("TELEGRAM_SETUP_KEY");
  if (!setupKey || req.headers.get("x-setup-key") !== setupKey) {
    return json({ error: "unauthorized" }, 401);
  }

  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!token) return json({ error: "TELEGRAM_BOT_TOKEN missing" }, 500);

  const base = Deno.env.get("SUPABASE_URL") ?? "";
  const webhookUrl = `${base}/functions/v1/telegram-webhook`;

  const action = (await req.json().catch(() => ({})))?.action ?? "set";
  const endpoint = action === "info" ? "getWebhookInfo" : "setWebhook";

  const res = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(
      action === "info"
        ? {}
        : { url: webhookUrl, allowed_updates: ["message", "edited_message"] },
    ),
  });

  const out = await res.json();
  return json(out, res.ok ? 200 : res.status);
});
