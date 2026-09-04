import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"
import { Check, X, Info, AlertTriangle } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Toaster "glass" façon notifications iOS/macOS :
 * - bannière horizontale compacte, fond translucide + backdrop-blur
 * - haut-droite sur desktop, haut-centre pleine largeur sur mobile
 */
const iconWrap = (bg: string, children: React.ReactNode) => (
  <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${bg}`}>{children}</div>
)

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false,
  )
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)")
    const onChange = () => setIsMobile(mql.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return isMobile
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const isMobile = useIsMobile()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={isMobile ? "top-center" : "top-right"}
      offset={isMobile ? "12px" : "20px"}
      visibleToasts={3}
      duration={3500}
      gap={10}
      className="toaster group"
      style={
        {
          "--width": isMobile ? "calc(100vw - 24px)" : "380px",
        } as React.CSSProperties
      }
      icons={{
        success: iconWrap("bg-success/15", <Check className="h-4 w-4 text-success" strokeWidth={3} />),
        error: iconWrap("bg-destructive/15", <X className="h-4 w-4 text-destructive" strokeWidth={3} />),
        info: iconWrap("bg-primary/15", <Info className="h-4 w-4 text-primary" />),
        warning: iconWrap("bg-warning/15", <AlertTriangle className="h-4 w-4 text-warning" />),
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast !w-full !rounded-2xl !px-4 !py-3 " +
            "!bg-background/70 dark:!bg-background/60 !backdrop-blur-xl !backdrop-saturate-150 " +
            "!text-foreground !border !border-border/50 " +
            "!shadow-[0_12px_40px_-12px_hsl(var(--foreground)/0.25)] " +
            "!flex !flex-row !items-center !gap-3 !text-left",
          content: "!flex !flex-col !gap-0.5 !min-w-0 !flex-1",
          title: "!text-[14px] !font-semibold !leading-tight !truncate",
          description: "!text-[12px] !text-muted-foreground !leading-snug !line-clamp-2",
          actionButton:
            "!rounded-full !text-[12px] !font-semibold !px-3 !py-1 !bg-primary !text-primary-foreground",
          cancelButton: "!rounded-full !text-[12px] !px-3 !py-1",
          icon: "!m-0 !w-8 !h-8 !shrink-0 !flex !items-center !justify-center",
          closeButton: "!rounded-full !bg-background/80 !border-border/50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
