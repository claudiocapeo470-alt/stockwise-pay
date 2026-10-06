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
  const start = useRef<{ x: number; y: number; offset: number } | null>(null);
  const locked = useRef<"h" | "v" | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const pendingOffset = useRef(0);

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

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  const updateOffset = (next: number) => {
    pendingOffset.current = next;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      setOffset(pendingOffset.current);
      frame.current = null;
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, offset: open ? -ACTION_W : 0 };
    locked.current = null;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (!locked.current) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      locked.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (locked.current !== "h") return;
    const raw = start.current.offset + dx;
    const next = raw < -ACTION_W ? -ACTION_W - Math.min(18, Math.abs(raw + ACTION_W) * 0.2) : Math.min(0, raw);
    updateOffset(next);
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const projected = start.current.offset + dx;
    setDragging(false);
    start.current = null;
    const shouldOpen = locked.current === "h" && projected < -ACTION_W * 0.38;
    setOpen(shouldOpen);
    setOffset(shouldOpen ? -ACTION_W : 0);
    pendingOffset.current = shouldOpen ? -ACTION_W : 0;
    locked.current = null;
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(e) => {
          if (open) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            setOffset(0);
          }
        }}
        style={{ transform: `translate3d(${offset}px,0,0)` }}
        className={cn(
          "relative bg-card touch-pan-y will-change-transform",
          !dragging && "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeToDelete;
