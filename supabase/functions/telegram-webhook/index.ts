// Webhook du bot Telegram Stocknix.
// Reçoit /start <link_token> et associe le chat Telegram à l'entreprise.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_API = "https://api.telegram.org";

async function reply(token: string, chatId: number | string, text: string) {
  await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), {
      status,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });

  try {
    const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!token) return json({ error: "TELEGRAM_BOT_TOKEN missing" }, 500);

    const update = await req.json().catch(() => null);
    const message = update?.message ?? update?.edited_message;
    const chatId = message?.chat?.id;
    const text: string = message?.text ?? "";
    if (!chatId) return json({ ok: true, ignored: true });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
        JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}")["default"] ?? "",
    );

    const start = text.trim().match(/^\/start(?:\s+(\S+))?$/);
    if (!start) {
      await reply(token, chatId, "Envoyez le lien de connexion depuis Stocknix (Paramètres → Telegram) pour lier ce compte.");
      return json({ ok: true });
    }

    const linkToken = start[1];
    if (!linkToken) {
      await reply(token, chatId, "❌ Lien de connexion manquant. Ouvrez Stocknix → Paramètres → Telegram et cliquez sur « Connecter Telegram ».");
      return json({ ok: true });
    }

    const { data: link } = await supabase
      .from("telegram_links")
      .select("id, token_expires_at")
      .eq("link_token", linkToken)
      .maybeSingle();

    if (!link) {
      await reply(token, chatId, "❌ Ce lien de connexion est invalide. Générez-en un nouveau dans Stocknix → Paramètres → Telegram.");
      return json({ ok: true });
    }

    if (link.token_expires_at && new Date(link.token_expires_at).getTime() < Date.now()) {
      await reply(token, chatId, "⏰ Ce lien de connexion a expiré (15 minutes). Générez-en un nouveau dans Stocknix → Paramètres → Telegram.");
      return json({ ok: true });
    }

    const username: string | null = message?.from?.username ?? null;

    const { error } = await supabase
      .from("telegram_links")
      .update({
        telegram_chat_id: String(chatId),
        telegram_username: username,
        linked_at: new Date().toISOString(),
        link_token: null,
        token_expires_at: null,
      })
      .eq("id", link.id);

    if (error) {
      await reply(token, chatId, "❌ Erreur lors de la connexion. Réessayez dans un instant.");
      return json({ error: error.message }, 500);
    }

    await reply(token, chatId, "✅ <b>Stocknix est maintenant connecté à ce compte Telegram.</b>\nVous recevrez ici vos alertes : nouvelles commandes, stock bas, paiements.");
    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
