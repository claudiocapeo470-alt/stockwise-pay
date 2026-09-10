import { Card, CardContent } from "@/components/ui/card";
import { ShieldQuestion } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function MinimalDashboard() {
  const { memberInfo } = useAuth();
  const firstName = memberInfo?.member_first_name || "Bonjour";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Bonjour, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground">Espace employé</p>
      </div>

      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto">
            <ShieldQuestion className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">Aucun accès configuré</h2>
          <p className="text-sm text-muted-foreground">
            Votre rôle{memberInfo?.member_role_name ? ` « ${memberInfo.member_role_name} »` : ""} n'a
            encore aucune permission active. Contactez le propriétaire de l'entreprise pour qu'il
            configure vos accès depuis « Mon équipe ».
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
