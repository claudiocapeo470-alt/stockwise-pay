import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyStateCard({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  onAction,
  className 
}: EmptyStateCardProps) {
  return (
    <Card className={cn("text-center", className)}>
      <CardHeader className="pb-4">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {actionLabel && onAction && (
        <CardContent className="pt-0">
          <Button 
            onClick={onAction}
            className="bg-gradient-secondary hover:opacity-90 transition-opacity"
          >
            {actionLabel}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}