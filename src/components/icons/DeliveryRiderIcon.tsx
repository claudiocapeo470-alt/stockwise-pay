import { cn } from "@/lib/utils";

/** Livreur à moto — illustration linéaire minimaliste. */
export function DeliveryRiderIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-20 w-20", className)}
      aria-hidden="true"
    >
      {/* roues */}
      <circle cx="14" cy="48" r="8" />
      <circle cx="50" cy="48" r="8" />
      {/* châssis moto */}
      <path d="M14 48h9l7-11h11l5 11" />
      <path d="M30 37l-4-7h-6" />
      <path d="M41 30h7l4 6" />
      {/* guidon */}
      <path d="M48 30l3-4h5" />
      {/* livreur */}
      <circle cx="34" cy="14" r="5" />
      <path d="M34 19v8l-4 8" />
      <path d="M34 22l8 3 6 3" />
      {/* sac de livraison */}
      <rect x="20" y="18" width="10" height="10" rx="2" />
    </svg>
  );
}
