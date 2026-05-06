/**
 * SWUpdater — Affiche un toast "Nouvelle version" lorsque le service worker détecte
 * une mise à jour, et déclenche un skipWaiting + reload contrôlé.
 * Ne fait rien en preview/iframe (le SW y est déjà désinscrit dans main.tsx).
 */
import { useEffect } from "react";
import { toast } from "sonner";

export function SWUpdater() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const isInIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
    if (isInIframe) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

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
              onClick: () => sw.postMessage?.({ type: "SKIP_WAITING" }),
            },
          });
        }
      });
    };

    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        if (reg.waiting) onUpdate(reg);
        reg.addEventListener("updatefound", () => onUpdate(reg));
        // Force la vérification toutes les 60 secondes pour ne pas rester sur ancienne version
        setInterval(() => reg.update().catch(() => {}), 60_000);
      });
    });
  }, []);

  return null;
}
