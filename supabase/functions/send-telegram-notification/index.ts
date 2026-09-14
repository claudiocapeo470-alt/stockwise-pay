// Envoie une notification Telegram à l'entreprise, si elle a lié son compte.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ICONS: Record<string, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

function esc(s: string) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
    if (!token) return json({ skipped: "no_bot_token" });

    const body = await req.json().catch(() => ({}));
    const companyId = String(body.company_id ?? "");
    const title = String(body.title ?? "").slice(0, 200);
    const messageText = String(body.message ?? "").slice(0, 2000);
    const type = String(body.type ?? "info");
    const url = body.url ? String(body.url) : null;

    if (!companyId || !title) return json({ error: "company_id and title required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
        JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}")["default"] ?? "",
    );

    const { data: link } = await supabase
      .from("telegram_links")
      .select("telegram_chat_id")
      .eq("company_id", companyId)
      .maybeSingle();

    if (!link?.telegram_chat_id) return json({ skipped: "not_linked" });

    const icon = ICONS[type] ?? ICONS.info;
    const text = `${icon} <b>${esc(title)}</b>\n${esc(messageText)}${url ? `\n\n${esc(url)}` : ""}`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: link.telegram_chat_id,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const out = await res.json().catch(() => ({}));
    if (!res.ok || out?.ok === false) {
      console.error("Telegram sendMessage failed", res.status, JSON.stringify(out));
      return json({ error: "telegram_failed", status: res.status, details: out }, res.status);
    }

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
