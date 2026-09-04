import { cn } from "@/lib/utils";

interface PageLoaderProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * Écran de chargement unique de l'app.
 * Spinner dans une carte glass translucide — jamais de flash blanc brut.
 */
export function PageLoader({ label = "Chargement…", fullScreen = true, className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background",
        fullScreen && "min-h-screen w-full",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card/60 px-8 py-6 shadow-soft backdrop-blur-xl">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        {label && <p className="text-sm text-muted-foreground">{label}</p>}
      </div>
    </div>
  );
}
