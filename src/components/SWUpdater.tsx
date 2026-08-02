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
              onClick: async () => {
                sw.postMessage?.({ type: "SKIP_WAITING" });
                // La navigation n'est rechargée qu'après le clic et l'activation réelle.
                await new Promise<void>((resolve) => {
                  if (sw.state === "activated") return resolve();
                  const handleState = () => {
                    if (sw.state === "activated") {
                      sw.removeEventListener("statechange", handleState);
                      resolve();
                    }
                  };
                  sw.addEventListener("statechange", handleState);
                  setTimeout(resolve, 3000);
                });
                window.location.reload();
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
