import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";

interface LogoutButtonProps {
  /** Custom trigger element (must accept a ref / be a valid child for asChild) */
  children?: ReactNode;
  className?: string;
  label?: string;
  iconOnly?: boolean;
  /** Called after the user confirms the logout */
  onConfirmed?: () => void;
}

/**
 * Bouton de déconnexion unifié (avec confirmation) utilisé partout dans l'app.
 */
export function LogoutButton({
  children,
  className,
  label = "Déconnexion",
  iconOnly = false,
  onConfirmed,
}: LogoutButtonProps) {
  const { signOut } = useAuth();

  const defaultTrigger = (
    <button
      type="button"
      aria-label={label}
      className={
        className ||
        (iconOnly
          ? "min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-destructive"
          : "w-full flex items-center justify-center gap-2 h-12 rounded-2xl text-[15px] font-semibold text-destructive bg-destructive/10 active:bg-destructive/20 transition-colors")
      }
    >
      <LogOut className={iconOnly ? "h-5 w-5" : "h-5 w-5 flex-shrink-0"} />
      {!iconOnly && label}
    </button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children ?? defaultTrigger}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-[320px] rounded-3xl p-6 text-center border-0">
        <AlertDialogHeader className="items-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-lg font-bold">Se déconnecter ?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Toute vente en cours à la caisse sera perdue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0 mt-4">
          <AlertDialogAction
            className="w-full h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              onConfirmed?.();
              signOut();
            }}
          >
            Se déconnecter
          </AlertDialogAction>
          <AlertDialogCancel className="w-full h-11 rounded-xl mt-0">Annuler</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
