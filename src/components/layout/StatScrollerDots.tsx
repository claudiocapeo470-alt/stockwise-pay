import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Ajoute automatiquement des pastilles de position sous chaque bandeau
 * `.stat-scroller` (mobile uniquement, masquées par CSS sur desktop).
 */
export function StatScrollerDots() {
  const location = useLocation();

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    const attach = () => {
      document.querySelectorAll<HTMLElement>(".stat-scroller").forEach((scroller) => {
        if (scroller.dataset.dotsBound === "1") return;
        const count = scroller.children.length;
        if (count < 2) return;
        scroller.dataset.dotsBound = "1";

        const dots = document.createElement("div");
        dots.className = "stat-dots";
        for (let i = 0; i < count; i++) {
          const dot = document.createElement("span");
          dot.dataset.active = i === 0 ? "true" : "false";
          dots.appendChild(dot);
        }
        scroller.insertAdjacentElement("afterend", dots);

        const onScroll = () => {
          const max = scroller.scrollWidth - scroller.clientWidth;
          const ratio = max > 0 ? scroller.scrollLeft / max : 0;
          const active = Math.round(ratio * (count - 1));
          Array.from(dots.children).forEach((d, i) => {
            (d as HTMLElement).dataset.active = i === active ? "true" : "false";
          });
        };
        scroller.addEventListener("scroll", onScroll, { passive: true });

        cleanups.push(() => {
          scroller.removeEventListener("scroll", onScroll);
          delete scroller.dataset.dotsBound;
          dots.remove();
        });
      });
    };

    const t1 = window.setTimeout(attach, 120);
    const t2 = window.setTimeout(attach, 600);
    const t3 = window.setTimeout(attach, 1500);

    return () => {
      [t1, t2, t3].forEach(clearTimeout);
      cleanups.forEach((fn) => fn());
    };
  }, [location.pathname]);

  return null;
}
