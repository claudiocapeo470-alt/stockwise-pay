import { useEffect, useState } from "react";
import { Bell, BellOff, Smartphone, Share, Plus, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  getExistingSubscription,
  isIOS,
  isPushSupported,
  isStandalone,
  sendPushNotification,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/webPush";

export function PushNotificationSettings() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  const supported = isPushSupported();
  const iosNotInstalled = isIOS() && !isStandalone();

  useEffect(() => {
    if (!supported) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
    getExistingSubscription().then((sub) => setSubscribed(Boolean(sub)));
  }, [supported]);

  const enable = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await subscribeToPush(user.id);
      setSubscribed(true);
      setPermission(Notification.permission);
      toast.success("Notifications activées sur cet appareil");
    } catch (err) {
      setPermission(typeof Notification !== "undefined" ? Notification.permission : "default");
      toast.error((err as Error).message || "Activation impossible");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      await unsubscribeFromPush();
      setSubscribed(false);
      toast.success("Notifications désactivées sur cet appareil");
    } catch {
      toast.error("Désactivation impossible");
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    if (!user) return;
    await sendPushNotification({
      user_id: user.id,
      title: "Stocknix",
      body: "Test réussi : vous recevrez bien vos alertes ici.",
      url: "/app",
      tag: "test",
    });
    toast.success("Notification de test envoyée");
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-primary" /> Notifications push
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Recevez les alertes de stock, ventes et commandes même quand l'application est fermée.
        </p>

        {!supported && (
          <p className="rounded-xl bg-muted p-3 text-sm">
            Cet appareil ou ce navigateur ne prend pas en charge les notifications push.
          </p>
        )}

        {supported && iosNotInstalled && (
          <div className="rounded-xl border border-border p-3.5 space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone className="h-4 w-4 text-primary" /> Installez d'abord Stocknix sur votre iPhone
            </p>
            <p className="text-sm text-muted-foreground">
              Sur iPhone, les notifications fonctionnent uniquement depuis l'app ajoutée à l'écran d'accueil.
            </p>
            <ol className="space-y-1 text-sm">
              <li>1. Appuyez sur <Share className="inline h-3.5 w-3.5 align-[-2px]" /> Partager dans Safari.</li>
              <li>2. Choisissez « Sur l'écran d'accueil » <Plus className="inline h-3.5 w-3.5 align-[-2px]" />.</li>
              <li>3. Ouvrez Stocknix depuis l'icône, puis revenez ici pour activer.</li>
            </ol>
          </div>
        )}

        {supported && !iosNotInstalled && permission === "denied" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 space-y-1">
            <p className="text-sm font-semibold">Notifications bloquées</p>
            <p className="text-sm text-muted-foreground">
              Vous avez refusé les notifications. Réautorisez-les dans les réglages de votre navigateur
              (cadenas dans la barre d'adresse → Notifications → Autoriser), puis revenez ici.
            </p>
          </div>
        )}

        {supported && !iosNotInstalled && permission !== "denied" && (
          <div className="flex flex-wrap gap-2">
            {subscribed ? (
              <>
                <Button variant="outline" className="rounded-xl gap-2" onClick={disable} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
                  Désactiver
                </Button>
                <Button variant="ghost" className="rounded-xl gap-2" onClick={test} disabled={busy}>
                  <Send className="h-4 w-4" /> Envoyer un test
                </Button>
              </>
            ) : (
              <Button className="rounded-xl gap-2" onClick={enable} disabled={busy || !user}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                Activer les notifications
              </Button>
            )}
          </div>
        )}

        {subscribed && (
          <p className="text-xs text-muted-foreground">Cet appareil est enregistré pour recevoir les notifications.</p>
        )}
      </CardContent>
    </Card>
  );
}
