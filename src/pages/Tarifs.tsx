import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePaiementPro, type PaiementProPlan } from "@/hooks/usePaiementPro";
import { SubscriptionPlansView } from "@/components/subscription/SubscriptionPlansView";

export default function Tarifs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { initPayment, loadingPlan } = usePaiementPro();
  const isExpired = searchParams.get("expired") === "true";

  const handleSubscribe = (planId: PaiementProPlan, amount: number) => {
    if (!user) {
      navigate("/auth?redirect=/tarifs");
      return;
    }
    initPayment({ plan: planId, amount, billing_cycle: "monthly" });
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-background flex flex-col">
      <header className="shrink-0 px-4 pt-4 pb-2 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/")} aria-label="Retour">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate(user ? "/app" : "/auth")}>
          {user ? "Mon espace" : "Connexion"}
        </Button>
      </header>

      {isExpired && (
        <div className="mx-4 mb-2 shrink-0 rounded-2xl bg-destructive/10 px-4 py-2.5 flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-xs font-medium">Votre abonnement est terminé. Choisissez un plan pour continuer.</p>
        </div>
      )}

      <main className="flex-1 min-h-0 px-4 pb-6 mx-auto w-full max-w-md">
        <SubscriptionPlansView
          loadingPlan={loadingPlan}
          ctaLabel={isExpired ? "Réactiver" : user ? "S'abonner" : "Créer un compte"}
          onSubscribe={handleSubscribe}
        />
      </main>
    </div>
  );
}
