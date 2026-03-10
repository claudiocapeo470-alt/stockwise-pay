import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LivreurRoleDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Mes Livraisons</h1><p className="text-sm text-muted-foreground">Gérez vos livraisons du jour</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-6 text-center"><Clock className="h-8 w-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold">—</p><p className="text-sm text-muted-foreground">À récupérer</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><Truck className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">—</p><p className="text-sm text-muted-foreground">En livraison</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><CheckCircle className="h-8 w-8 text-success mx-auto mb-2" /><p className="text-2xl font-bold">—</p><p className="text-sm text-muted-foreground">Livrées aujourd'hui</p></CardContent></Card>
      </div>
      <Button className="w-full h-14 text-lg gap-3" onClick={() => navigate('/app/livreur')}><Truck className="h-6 w-6" /> Voir mes livraisons</Button>
    </div>
  );
}
