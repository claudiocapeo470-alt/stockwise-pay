import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, ShoppingCart, Award, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/hooks/useTeam";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import { useSearchParams } from "react-router-dom";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";

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

  const memberStats = useMemo(() => {
    if (!selectedMember || !sales) return null;
    const mid = selectedMember.id;
    const now = new Date();
    const ranges = {
      today: { from: startOfDay(now), to: endOfDay(now) },
      week: { from: startOfWeek(now, { locale: fr }), to: endOfWeek(now, { locale: fr }) },
      month: { from: startOfMonth(now), to: endOfMonth(now) },
      year: { from: startOfYear(now), to: endOfYear(now) },
    };
    const myS = sales.filter(s => s.created_by_member_id === mid);
    const calc = (range: { from: Date; to: Date }) => {
      const f = myS.filter(s => isWithinInterval(parseISO(s.sale_date), { start: range.from, end: range.to }));
      return { count: f.length, revenue: f.reduce((s, v) => s + Number(v.total_amount), 0) };
    };
    return {
      today: calc(ranges.today),
      week: calc(ranges.week),
      month: calc(ranges.month),
      year: calc(ranges.year),
      total: myS.length,
      totalRevenue: myS.reduce((s, v) => s + Number(v.total_amount), 0),
    };
  }, [selectedMember, sales]);

  const memberRole = memberInfo?.member_role_name?.toLowerCase() || '';
  const isManager = memberRole.includes('manager');

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })
      .format(price).replace('XOF', 'CFA');

  // Allow owner + manager access
  if (isEmployee && !isManager) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Vous n'avez pas accès à cette page.
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-6xl mx-auto pb-8">
      {/* Stats globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: Users, tint: 'bg-primary/10 text-primary', value: String(stats.totalMembers), label: 'Employés actifs' },
          { icon: ShoppingCart, tint: 'bg-success/10 text-success', value: String(stats.totalSales), label: 'Ventes totales' },
          { icon: TrendingUp, tint: 'bg-warning/10 text-warning', value: formatPrice(stats.totalRevenue), label: "Chiffre d'affaires" },
          { icon: Award, tint: 'bg-accent/10 text-accent-foreground', value: formatPrice(stats.totalPaid), label: 'Encaissé' },
        ].map(({ icon: Icon, tint, value, label }) => (
          <div key={label} className="rounded-3xl bg-card p-4 shadow-sm">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 ${tint}`}>
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <p className="text-lg sm:text-xl font-bold truncate">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
          </div>
        ))}
      </div>

      {/* Sélecteur */}
      <div className="rounded-3xl bg-card p-4 shadow-sm space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Sélectionner un employé
        </label>
        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
          <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-0">
            <SelectValue placeholder="Choisir un membre" />
          </SelectTrigger>
          <SelectContent>
            {activeMembers.map(m => (
              <SelectItem key={m.id} value={m.id}>
                {m.first_name} {m.last_name || ''} — {m.role?.name || 'Sans rôle'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fiche employé */}
      {selectedMember ? (
        <div className="space-y-4">
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {selectedMember.first_name[0]}{(selectedMember.last_name || '')[0] || ''}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-lg truncate">
                  {selectedMember.first_name} {selectedMember.last_name || ''}
                </p>
                <Badge variant="secondary" className="rounded-full mt-1">
                  {selectedMember.role?.name || 'Sans rôle'}
                </Badge>
              </div>
              {memberStats && (
                <div className="ml-auto text-right shrink-0">
                  <p className="text-xl font-bold">{memberStats.total}</p>
                  <p className="text-[11px] text-muted-foreground">ventes</p>
                </div>
              )}
            </div>
            {memberStats && (
              <div className="mt-4 rounded-2xl bg-background/70 px-4 py-3">
                <p className="text-[11px] text-muted-foreground">Chiffre d'affaires cumulé</p>
                <p className="text-lg font-bold text-primary">{formatPrice(memberStats.totalRevenue)}</p>
              </div>
            )}
          </div>

          {/* Stats par période */}
          {memberStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: "Aujourd'hui", data: memberStats.today },
                { label: 'Cette semaine', data: memberStats.week },
                { label: 'Ce mois', data: memberStats.month },
                { label: 'Cette année', data: memberStats.year },
              ].map(({ label, data }) => (
                <div key={label} className="rounded-3xl bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
                  </div>
                  <p className="text-xl font-bold">
                    {data.count} <span className="text-xs font-normal text-muted-foreground">ventes</span>
                  </p>
                  <p className="text-sm font-semibold text-primary truncate">{formatPrice(data.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl bg-card p-10 text-center text-muted-foreground shadow-sm">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Sélectionnez un employé pour voir ses statistiques</p>
        </div>
      )}
    </div>
  );
}
