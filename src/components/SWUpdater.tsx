/**
 * SWUpdater — Affiche un toast "Nouvelle version" lorsque le service worker détecte
 * une mise à jour. Le rechargement est déclenché uniquement par action utilisateur
 * (clic sur "Recharger") pour éviter les boucles de rechargement automatique.
 * Ne fait rien en preview/iframe (le SW y est déjà désinscrit dans main.tsx).
 */
import { useEffect } from "react";
import { toast } from "sonner";

export function SWUpdater() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const isInIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
    if (isInIframe) return;

    const onUpdate = (reg: ServiceWorkerRegistration) => {
      const sw = reg.waiting || reg.installing;
      if (!sw) return;
      sw.addEventListener("statechange", () => {
        if (sw.state === "installed" && navigator.serviceWorker.controller) {
          toast("Nouvelle version disponible", {
            description: "Cliquez pour recharger l'application.",
            duration: Infinity,
            action: {
              label: "Recharger",
              onClick: () => {
                sw.postMessage?.({ type: "SKIP_WAITING" });
                // Recharge une seule fois après activation
                setTimeout(() => window.location.reload(), 300);
              },
            },
          });
        }
      });
    };

    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        if (reg.waiting) onUpdate(reg);
        reg.addEventListener("updatefound", () => onUpdate(reg));
      });
    });
  }, []);

  return null;
}
