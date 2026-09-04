import { supabase } from "@/integrations/supabase/client";

export const VAPID_PUBLIC_KEY =
  "BKsqnh7RJyqLoJewOj75ACrzTrXNOORBk-5LUWDw3Zxz__FPINQi78aAa4epgNGU5ufMU9EdKBXkWXighpFaM1I";

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as unknown as { MSStream?: unknown }).MSStream;

export const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true);

export const isPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export function detectDeviceType(): "android" | "ios" | "desktop" {
  if (isIOS()) return "ios";
  if (typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)) return "android";
  return "desktop";
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

/** Demande la permission puis enregistre l'abonnement en base. */
export async function subscribeToPush(userId: string): Promise<PushSubscription> {
  if (!isPushSupported()) throw new Error("Notifications non supportées sur cet appareil.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permission refusée.");

  const registration =
    (await navigator.serviceWorker.getRegistration("/")) ?? (await navigator.serviceWorker.ready);
  if (!registration) throw new Error("Service worker indisponible.");

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    }));

  const json = subscription.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

  const { error } = await supabase.from("push_subscriptions" as never).upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: json.keys?.p256dh ?? arrayBufferToBase64(subscription.getKey("p256dh")),
      auth: json.keys?.auth ?? arrayBufferToBase64(subscription.getKey("auth")),
      device_type: detectDeviceType(),
      user_agent: navigator.userAgent,
    } as never,
    { onConflict: "endpoint" } as never,
  );
  if (error) throw error;

  return subscription;
}

/** Désabonnement propre : navigateur + base. */
export async function unsubscribeFromPush(): Promise<void> {
  const subscription = await getExistingSubscription();
  if (!subscription) return;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await supabase.from("push_subscriptions" as never).delete().eq("endpoint" as never, endpoint as never);
}

export interface PushPayload {
  user_id?: string;
  user_ids?: string[];
  title: string;
  body: string;
  url?: string;
  tag?: string;
  /** Notification prioritaire : reste affichée jusqu'à interaction de l'utilisateur. */
  requireInteraction?: boolean;
}

/** Envoie une notification push via l'Edge Function (silencieux en cas d'échec). */
export async function sendPushNotification(payload: PushPayload): Promise<void> {
  try {
    await supabase.functions.invoke("send-push-notification", { body: payload });
  } catch (err) {
    console.warn("[push] envoi impossible:", err);
  }
}
