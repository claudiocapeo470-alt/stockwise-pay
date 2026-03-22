import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, ShoppingCart, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/hooks/useTeam";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import { useSearchParams } from "react-router-dom";
import { useAuth as useAuthForMember } from "@/contexts/AuthContext";

export default function RapportEmployes() {
  const [searchParams] = useSearchParams();
  const initialMember = searchParams.get('member');
  const [selectedMemberId, setSelectedMemberId] = useState(initialMember || "");
  const { isEmployee, memberInfo } = useAuth();
  const { members } = useTeam();
  const { sales = [] } = useSales();
  const { payments = [] } = usePayments();

  const activeMembers = useMemo(() => members.filter(m => m.is_active), [members]);
  const selectedMember = useMemo(() => members.find(m => m.id === selectedMemberId), [members, selectedMemberId]);

  const stats = useMemo(() => {
    const totalMembers = activeMembers.length;
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalPaid = completedPayments.reduce((sum, p) => sum + Number(p.total_amount), 0);
    return { totalMembers, totalSales, totalRevenue, totalPaid };
  }, [activeMembers, sales, payments]);

  const memberRole = memberInfo?.member_role_name?.toLowerCase() || '';
  const isManager = memberRole.includes('manager');

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })
      .format(price).replace('XOF', 'CFA');

  if (isEmployee && !isManager) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Vous n'avez pas accès à cette page.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
              <p className="text-sm text-muted-foreground">Employés actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-success/10 flex items-center justify-center rounded-xl">
              <ShoppingCart className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalSales}</p>
              <p className="text-sm text-muted-foreground">Ventes totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-warning/10 flex items-center justify-center rounded-xl">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatPrice(stats.totalRevenue)}</p>
              <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-secondary/10 flex items-center justify-center rounded-xl">
              <Award className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatPrice(stats.totalPaid)}</p>
              <p className="text-sm text-muted-foreground">Encaissé</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sélecteur */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Sélectionner un employé</label>
        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
          <SelectTrigger className="max-w-sm"><SelectValue placeholder="Choisir un membre" /></SelectTrigger>
          <SelectContent>
            {activeMembers.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name || ''} — {m.role?.name || 'Sans rôle'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fiche employé */}
      {selectedMember ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {selectedMember.first_name[0]}{(selectedMember.last_name || '')[0] || ''}
              </div>
              <div>
                <p className="font-semibold text-lg">{selectedMember.first_name} {selectedMember.last_name || ''}</p>
                <Badge variant="secondary">{selectedMember.role?.name || 'Sans rôle'}</Badge>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Les statistiques détaillées par employé seront disponibles prochainement.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Sélectionnez un employé pour voir ses statistiques</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
