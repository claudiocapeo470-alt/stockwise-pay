import * as React from "react"
import { toast as sonnerToast } from "sonner"

/**
 * Adaptateur de compatibilité : l'ancienne API `useToast()` (Radix) est
 * redirigée vers sonner, seul système de toasts de l'application.
 */
export interface LegacyToastOptions {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive" | "success" | "warning"
  duration?: number
  action?: { label: string; onClick: () => void }
}

function toast({ title, description, variant, duration, action }: LegacyToastOptions = {}) {
  const message = (title ?? description ?? "") as string
  const options = {
    description: title ? (description as string | undefined) : undefined,
    duration: duration ?? (action ? 6000 : 3500),
    action,
  }

  const id =
    variant === "destructive"
      ? sonnerToast.error(message, options)
      : variant === "success"
        ? sonnerToast.success(message, options)
        : variant === "warning"
          ? sonnerToast.warning(message, options)
          : sonnerToast(message, options)

  return {
    id: String(id),
    dismiss: () => sonnerToast.dismiss(id),
    update: () => undefined,
  }
}

function useToast() {
  return {
    toasts: [] as unknown[],
    toast,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  }
}

export { useToast, toast }
