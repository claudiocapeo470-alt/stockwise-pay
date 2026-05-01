import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Toaster style "iOS Dynamic Island" :
 * - Position : haut centré
 * - Forme : pilule arrondie noire (mode clair) / blanc translucide (mode sombre)
 * - Animation slide-down + scale (depuis le haut)
 * - Backdrop blur premium
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      offset={12}
      visibleToasts={3}
      duration={3500}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast !rounded-full !px-5 !py-3 !min-h-[48px] !max-w-[92vw] sm:!max-w-[420px] " +
            "!bg-[#0A0A0A] dark:!bg-white/95 !text-white dark:!text-black " +
            "!border-0 !shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] " +
            "backdrop-blur-xl !flex !items-center !gap-3 " +
            "data-[type=success]:!bg-[#0A0A0A] dark:data-[type=success]:!bg-white/95 " +
            "data-[type=error]:!bg-[#1a0606] dark:data-[type=error]:!bg-white/95 " +
            "animate-[ios-slide-down_0.35s_cubic-bezier(0.34,1.56,0.64,1)]",
          title: "!text-sm !font-semibold !leading-tight",
          description: "!text-xs !opacity-80 !text-white/80 dark:!text-black/70 !mt-0.5",
          actionButton:
            "!bg-white !text-black dark:!bg-black dark:!text-white !rounded-full !text-xs !font-semibold !px-3 !py-1",
          cancelButton:
            "!bg-white/10 !text-white dark:!bg-black/10 dark:!text-black !rounded-full !text-xs !px-3 !py-1",
          icon: "!text-white dark:!text-black",
          success: "!text-emerald-400 dark:!text-emerald-600",
          error: "!text-red-400 dark:!text-red-600",
          info: "!text-sky-400 dark:!text-sky-600",
          warning: "!text-amber-400 dark:!text-amber-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
