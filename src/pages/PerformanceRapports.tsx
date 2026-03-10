import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText, ArrowLeft, Users, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Performance from "./Performance";
import Rapports from "./Rapports";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/hooks/useTeam";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import { useSearchParams } from "react-router-dom";

export default function PerformanceRapports() {
  const [searchParams] = useSearchParams();
  const initialMember = searchParams.get('member');
  const initialTab = initialMember ? "employee" : "performance";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedMemberId, setSelectedMemberId] = useState(initialMember || "");
  const { isEmployee } = useAuth();
  const { members } = useTeam();
  const { products = [] } = useProducts();
  const { sales = [] } = useSales();
  const { payments = [] } = usePayments();

  const selectedMember = useMemo(() => members.find(m => m.id === selectedMemberId), [members, selectedMemberId]);

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalPaid = completedPayments.reduce((sum, p) => sum + Number(p.total_amount), 0);
    return {
      totalSales: sales.length,
      totalRevenue,
      totalProducts: products.length,
      totalPaid,
    };
  }, [sales, products, payments]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })
      .format(price).replace('XOF', 'CFA');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalSales}</p>
              <p className="text-sm text-muted-foreground">Ventes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-success/10 flex items-center justify-center rounded-xl">
              <BarChart3 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatPrice(stats.totalRevenue)}</p>
              <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-warning/10 flex items-center justify-center rounded-xl">
              <PieChart className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatPrice(stats.totalPaid)}</p>
              <p className="text-sm text-muted-foreground">Encaissé</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-secondary/10 flex items-center justify-center rounded-xl">
              <FileText className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
              <p className="text-sm text-muted-foreground">Produits</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="performance" className="flex-1 sm:flex-none gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="rapports" className="flex-1 sm:flex-none gap-1.5">
            <FileText className="h-4 w-4" />
            <span>Rapports</span>
          </TabsTrigger>
          {!isEmployee && (
            <TabsTrigger value="employee" className="flex-1 sm:flex-none gap-1.5">
              <Users className="h-4 w-4" />
              <span>Par Employé</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="performance">
          <Performance />
        </TabsContent>

        <TabsContent value="rapports">
          <Rapports />
        </TabsContent>

        {!isEmployee && (
          <TabsContent value="employee">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Performance par Employé</h2>
                <p className="text-sm text-muted-foreground">Sélectionnez un membre pour voir ses statistiques</p>
              </div>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="max-w-sm"><SelectValue placeholder="Sélectionner un membre" /></SelectTrigger>
                <SelectContent>
                  {members.filter(m => m.is_active).map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name || ''} — {m.role?.name || 'Sans rôle'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMember && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {selectedMember.first_name[0]}{(selectedMember.last_name || '')[0] || ''}
                      </div>
                      <div>
                        <p className="font-semibold">{selectedMember.first_name} {selectedMember.last_name || ''}</p>
                        <Badge variant="secondary">{selectedMember.role?.name || 'Sans rôle'}</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">Les statistiques détaillées par employé seront disponibles prochainement.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
