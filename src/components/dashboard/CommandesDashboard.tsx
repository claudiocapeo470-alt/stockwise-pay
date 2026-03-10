import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CommandesDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Gestion Commandes</h1><p className="text-sm text-muted-foreground">Gérez les commandes de la boutique</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-6 text-center"><ClipboardList className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">—</p><p className="text-sm text-muted-foreground">Nouvelles commandes</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><Clock className="h-8 w-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold">—</p><p className="text-sm text-muted-foreground">En préparation</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><CheckCircle className="h-8 w-8 text-success mx-auto mb-2" /><p className="text-2xl font-bold">—</p><p className="text-sm text-muted-foreground">Prêtes à livrer</p></CardContent></Card>
      </div>
      <Button className="w-full h-12 gap-2" onClick={() => navigate('/app/boutique/commandes')}><ClipboardList className="h-5 w-5" /> Voir les commandes</Button>
    </div>
  );
}
