/**
 * ============================================================
 * StorePixels.tsx — Suivi publicitaire du storefront
 * Charge les pixels de CETTE boutique uniquement, après
 * acceptation de la bannière de consentement cookies.
 * ============================================================
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadPixels, resetPixels, setPixelConfig, type ShopPixels } from "@/lib/pixels";
import { Cookie } from "lucide-react";

interface Props {
  storeId?: string;
  /** Couleur principale de la boutique pour le bouton d'acceptation */
  color?: string;
}

const consentKey = (storeId: string) => `pixel-consent-${storeId}`;

export default function StorePixels({ storeId, color = "#2563EB" }: Props) {
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);
  const [config, setConfig] = useState<ShopPixels | null>(null);

  // Consentement mémorisé
  useEffect(() => {
    if (!storeId) return;
    const saved = localStorage.getItem(consentKey(storeId));
    setConsent(saved === "granted" ? "granted" : saved === "denied" ? "denied" : null);
  }, [storeId]);

  // Configuration des pixels de cette boutique
  useEffect(() => {
    let cancelled = false;
    resetPixels();
    setConfig(null);
    if (!storeId) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("shop_pixels")
        .select("*")
        .eq("shop_id", storeId)
        .maybeSingle();
      if (!cancelled && data) setConfig(data as ShopPixels);
    })();
    return () => { cancelled = true; };
  }, [storeId]);

  // Chargement effectif uniquement après acceptation
  useEffect(() => {
    if (consent !== "granted" || !config) return;
    setPixelConfig(config);
    loadPixels();
  }, [consent, config]);

  const hasActive =
    !!config && Object.values(config.enabled_platforms || {}).some(Boolean);

  const decide = (value: "granted" | "denied") => {
    if (storeId) localStorage.setItem(consentKey(storeId), value);
    setConsent(value);
  };

  if (!storeId || consent !== null || !hasActive) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-background shadow-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
            <Cookie className="h-4 w-4" style={{ color }} />
          </div>
          <p className="text-[13px] leading-snug text-muted-foreground">
            Nous utilisons des cookies de mesure d'audience et de publicité pour améliorer
            votre expérience. Aucun suivi n'est activé sans votre accord.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => decide("denied")}
            className="h-10 px-4 rounded-full border border-border text-sm font-semibold hover:bg-muted transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={() => decide("granted")}
            className="h-10 px-5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: color }}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
