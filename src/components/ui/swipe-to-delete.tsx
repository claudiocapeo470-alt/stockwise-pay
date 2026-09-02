import { ReactNode, useRef, useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_W = 84; // largeur du bouton révélé

/**
 * Ligne glissable (swipe de droite à gauche) révélant une action
 * de suppression rouge, à la manière des listes iOS.
 */
export function SwipeToDelete({
  children,
  onDelete,
  label = "Supprimer",
  className,
}: {
  children: ReactNode;
  onDelete: () => void;
  label?: string;
  className?: string;
}) {
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const locked = useRef<"h" | "v" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setOffset(0);
      }
    };
    document.addEventListener("touchstart", close, { passive: true });
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("touchstart", close);
      document.removeEventListener("mousedown", close);
    };
  }, [open]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
    locked.current = null;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!start.current) return;
    const t = e.touches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    if (!locked.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      locked.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (locked.current !== "h") return;
    const base = open ? -ACTION_W : 0;
    const next = Math.min(0, Math.max(-ACTION_W - 20, base + dx));
    setOffset(next);
  };

  const onTouchEnd = () => {
    setDragging(false);
    start.current = null;
    const shouldOpen = offset < -ACTION_W / 2;
    setOpen(shouldOpen);
    setOffset(shouldOpen ? -ACTION_W : 0);
  };

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {/* Action révélée */}
      <button
        type="button"
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
          setOffset(0);
          onDelete();
        }}
        style={{ width: ACTION_W }}
        className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 bg-destructive text-destructive-foreground"
      >
        <Trash2 className="h-5 w-5" />
        <span className="text-[11px] font-semibold">{label}</span>
      </button>

      {/* Contenu glissant */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClickCapture={(e) => {
          if (open) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            setOffset(0);
          }
        }}
        style={{ transform: `translate3d(${offset}px,0,0)` }}
        className={cn("relative bg-card", !dragging && "transition-transform duration-200 ease-out")}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeToDelete;
