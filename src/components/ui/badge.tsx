import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-sm hover:shadow-glow",
        secondary:
          "border-transparent bg-gradient-to-r from-secondary to-accent text-secondary-foreground shadow-sm hover:shadow-blue-glow",
        destructive:
          "border-transparent bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-sm hover:shadow-lg hover:shadow-destructive/20",
        outline: "border-border/50 text-foreground bg-card/50 backdrop-blur-sm hover:bg-muted hover:border-border",
        success: "border-transparent bg-gradient-to-r from-primary to-teal-500 text-primary-foreground shadow-sm hover:shadow-turquoise-glow",
        warning: "border-transparent bg-gradient-to-r from-warning to-orange-500 text-warning-foreground shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
