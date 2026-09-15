import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, Check, Loader2, Unplug, ExternalLink } from "lucide-react";
import {
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_TOKEN_TTL_MINUTES,
  generateLinkToken,
  telegramStartUrl,
} from "@/lib/telegram";

interface TelegramLink {
  id: string;
  telegram_chat_id: string | null;
  telegram_username: string | null;
  linked_at: string | null;
  link_token: string | null;
  token_expires_at: string | null;
}

export function TelegramSettings() {
  const { company } = useCompany();
  const companyId = company?.id;
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);

  const { data: link, isLoading } = useQuery({
    queryKey: ["telegram-link", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("telegram_links")
        .select("id, telegram_chat_id, telegram_username, linked_at, link_token, token_expires_at")
        .eq("company_id", companyId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as TelegramLink | null;
    },
    enabled: !!companyId,
  });

  // Confirmation en temps réel : dès que le bot enregistre le chat_id, l'UI se met à jour.
  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel(`telegram-link-${companyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telegram_links", filter: `company_id=eq.${companyId}` },
        () => queryClient.invalidateQueries({ queryKey: ["telegram-link", companyId] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [companyId, queryClient]);

  const isConnected = !!link?.telegram_chat_id;
  const tokenPending = !!link?.link_token &&
    !!link?.token_expires_at &&
    new Date(link.token_expires_at).getTime() > Date.now();

  const connect = async () => {
    if (!companyId) return;
    setConnecting(true);
    try {
      const token = generateLinkToken();
      const expires = new Date(Date.now() + TELEGRAM_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();
      const { error } = await supabase
        .from("telegram_links")
        .upsert(
          { company_id: companyId, link_token: token, token_expires_at: expires },
          { onConflict: "company_id" },
        );
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["telegram-link", companyId] });
      window.open(telegramStartUrl(token), "_blank", "noopener,noreferrer");
      toast.info("Ouvrez Telegram et appuyez sur Démarrer pour finaliser la connexion.");
    } catch (e) {
      toast.error("Impossible de préparer la connexion : " + (e as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!link) return;
    const { error } = await supabase
      .from("telegram_links")
      .delete()
      .eq("id", link.id);
    if (error) {
      toast.error("Erreur lors de la déconnexion");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["telegram-link", companyId] });
    toast.success("Telegram déconnecté");
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Send className="h-4 w-4 text-muted-foreground" /> Notifications Telegram
        </div>

        <p className="text-sm text-muted-foreground">
          Recevez vos alertes (nouvelle commande, stock bas, paiement) directement
          dans Telegram via <span className="font-medium text-foreground">@{TELEGRAM_BOT_USERNAME}</span>,
          en plus des notifications push.
        </p>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Vérification…
          </div>
        ) : isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <Check className="h-4 w-4 text-success" />
              <div className="text-sm">
                <span className="font-medium">Telegram connecté</span>
                {link!.telegram_username && (
                  <span className="text-muted-foreground"> — @{link!.telegram_username}</span>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={disconnect} className="gap-2">
              <Unplug className="h-4 w-4" /> Déconnecter
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tokenPending && (
              <p className="text-xs text-muted-foreground">
                Connexion en attente — ouvrez le bot et appuyez sur « Démarrer »
                (lien valable {TELEGRAM_TOKEN_TTL_MINUTES} minutes).
              </p>
            )}
            <Button onClick={connect} disabled={connecting} className="gap-2">
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Connecter Telegram
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
