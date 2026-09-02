import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"
import { Check, X, Info, AlertTriangle } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Toaster "popup carré centré" :
 * - Position : centré à l'écran
 * - Forme : carré arrondi avec grande icône (succès / erreur)
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  const iconWrap = (bg: string, children: React.ReactNode) => (
    <div className={`h-14 w-14 rounded-full flex items-center justify-center ${bg}`}>{children}</div>
  )

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      offset="38vh"
      visibleToasts={1}
      duration={2200}
      className="toaster group"
      icons={{
        success: iconWrap("bg-success/10", <Check className="h-7 w-7 text-success" strokeWidth={3} />),
        error: iconWrap("bg-destructive/10", <X className="h-7 w-7 text-destructive" strokeWidth={3} />),
        info: iconWrap("bg-primary/10", <Info className="h-7 w-7 text-primary" />),
        warning: iconWrap("bg-warning/10", <AlertTriangle className="h-7 w-7 text-warning" />),
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast !w-[210px] !min-h-[210px] !mx-auto !rounded-3xl !p-6 " +
            "!bg-card !text-foreground !border !border-border " +
            "!shadow-[0_24px_60px_-20px_hsl(var(--foreground)/0.35)] " +
            "!flex !flex-col !items-center !justify-center !text-center !gap-3 " +
            "animate-scale-in",
          content: "!flex !flex-col !items-center !gap-1 !w-full",
          title: "!text-[15px] !font-semibold !leading-snug !text-center !w-full",
          description: "!text-xs !text-muted-foreground !text-center !w-full",
          actionButton: "!rounded-full !text-xs !font-semibold !px-3 !py-1",
          cancelButton: "!rounded-full !text-xs !px-3 !py-1",
          icon: "!m-0 !w-14 !h-14 !flex !items-center !justify-center",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
