import { supabase } from "@/integrations/supabase/client";

/** Nom d'utilisateur du bot Telegram Stocknix (sans le @). */
export const TELEGRAM_BOT_USERNAME = "StocknixBot";

export const telegramStartUrl = (linkToken: string) =>
  `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${encodeURIComponent(linkToken)}`;

/** Durée de validité d'un jeton de liaison. */
export const TELEGRAM_TOKEN_TTL_MINUTES = 15;

export function generateLinkToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

/** Envoi best-effort d'une notification Telegram (ignoré si non lié). */
export async function sendTelegramNotification(params: {
  companyId: string;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  url?: string;
}): Promise<void> {
  try {
    await supabase.functions.invoke("send-telegram-notification", {
      body: {
        company_id: params.companyId,
        title: params.title,
        message: params.message,
        type: params.type ?? "info",
        url: params.url,
      },
    });
  } catch (e) {
    console.warn("Telegram notification skipped:", e);
  }
}
