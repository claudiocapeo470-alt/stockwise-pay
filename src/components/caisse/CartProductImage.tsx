import { useState } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function CartProductImage({ item, size = "default" }: {
  item: { name: string; image_url?: string | null };
  size?: "sm" | "default";
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return (
    <div className={cn("shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted flex items-center justify-center", size === "sm" ? "h-9 w-9" : "h-12 w-12")}>
      {item.image_url && failedSrc !== item.image_url ? (
        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" onError={() => setFailedSrc(item.image_url || null)} />
      ) : <Package className="h-5 w-5 text-muted-foreground" />}
    </div>
  );
}