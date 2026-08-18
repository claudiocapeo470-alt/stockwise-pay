import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/**
 * En-tête standard des dialogues Stocknix :
 * pastille ronde + titre + sous-titre, avec barre de progression optionnelle.
 */
export function DialogHead({
  icon: Icon,
  title,
  subtitle,
  step,
  totalSteps,
  className,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  className?: string;
  children?: ReactNode;
}) {
  const progress =
    step && totalSteps ? Math.min(100, Math.round((step / totalSteps) * 100)) : null;

  return (
    <DialogHeader className={cn("space-y-0 text-left", className)}>
      <div className="flex items-center gap-3 pr-8">
        {Icon && (
          <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-foreground" strokeWidth={1.8} />
          </div>
        )}
        <div className="min-w-0">
          <DialogTitle className="text-[17px] font-bold leading-tight truncate">{title}</DialogTitle>
          {subtitle && (
            <DialogDescription className="text-[13px] leading-snug mt-0.5 truncate">
              {subtitle}
            </DialogDescription>
          )}
        </div>
      </div>
      {progress !== null && (
        <div className="mt-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {children}
    </DialogHeader>
  );
}
