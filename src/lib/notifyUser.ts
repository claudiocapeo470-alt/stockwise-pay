import { toast } from "sonner";
import { sendPushNotification } from "@/lib/webPush";

interface NotifyUserParams {
  companyId?: string;
  userId?: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export function notifyUser({
  companyId,
  userId,
  type,
  title,
  message,
  url,
  tag,
  requireInteraction,
}: NotifyUserParams) {
  toast[type](title, { description: message });

  void sendPushNotification({
    user_id: userId,
    title,
    body: message,
    url,
    tag,
    requireInteraction,
    company_id: companyId,
    type,
  });
}