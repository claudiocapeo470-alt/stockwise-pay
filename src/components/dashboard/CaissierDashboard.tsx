import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Scan, ShoppingCart, TrendingUp, TrendingDown, Clock, ArrowUp, ArrowDown, User, History } from 'lucide-react';
import { useSales } from '@/hooks/useSales';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useCompany } from '@/hooks/useCompany';

export function CaissierDashboard() {
  const { sales } = useSales();
  const { memberInfo, user, isEmployee } = useAuth();
  const { company } = useCompany();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const firstName = memberInfo?.member_first_name || 'Caissier';

  const effectiveUserId = isEmployee ? (memberInfo?.owner_id || company?.owner_id) : user?.id;

  // Check open session
  const { data: openSession } = useQuery({
    queryKey: ['cash-session-open', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return null;
      const { data } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('user_id', effectiveUserId)
        .eq('status', 'open')
        .order('opened_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!effectiveUserId,
  });

  const metrics = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todaySales = sales.filter(s =>
      new Date(s.sale_date).toDateString() === today.toDateString()
    );
    const yesterdaySales = sales.filter(s =>
      new Date(s.sale_date).toDateString() === yesterday.toDateString()
    );

    const total = todaySales.reduce((s, v) => s + v.total_amount, 0);
    const yesterdayTotal = yesterdaySales.reduce((s, v) => s + v.total_amount, 0);
    const trend = yesterdayTotal > 0 ? ((total - yesterdayTotal) / yesterdayTotal) * 100 : 0;

    return {
      count: todaySales.length,
      total,
      avg: todaySales.length ? Math.round(total / todaySales.length) : 0,
      lastSaleTime: todaySales.length
        ? new Date(todaySales[todaySales.length - 1].sale_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : null,
      trend: Math.round(trend),
      todaySales,
    };
  }, [sales]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Bonjour, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground">Vos statistiques du jour</p>
      </div>

      {/* Session status */}
      <Card className={openSession ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${openSession ? 'bg-green-500 animate-pulse' : 'bg-destructive'}`} />
            <span className="font-medium text-sm">Session de caisse</span>
          </div>
          <Badge variant={openSession ? 'default' : 'destructive'} className={openSession ? 'bg-green-500' : ''}>
            {openSession ? 'Ouverte' : 'Fermée'}
          </Badge>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-5 text-center">
          <TrendingUp className="h-7 w-7 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(metrics.total)}</p>
          <p className="text-xs text-muted-foreground">Encaissés</p>
          {metrics.trend !== 0 && (
            <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${metrics.trend > 0 ? 'text-green-500' : 'text-destructive'}`}>
              {metrics.trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(metrics.trend)}% vs hier
            </div>
          )}
        </CardContent></Card>
        <Card><CardContent className="p-5 text-center">
          <ShoppingCart className="h-7 w-7 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{metrics.count}</p>
          <p className="text-xs text-muted-foreground">Transactions</p>
        </CardContent></Card>
        <Card><CardContent className="p-5 text-center">
          <TrendingUp className="h-7 w-7 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(metrics.avg)}</p>
          <p className="text-xs text-muted-foreground">Panier moyen</p>
        </CardContent></Card>
        <Card><CardContent className="p-5 text-center">
          <Clock className="h-7 w-7 text-orange-500 mx-auto mb-2" />
          <p className="text-lg font-bold">{metrics.lastSaleTime || '--:--'}</p>
          <p className="text-xs text-muted-foreground">Dernière vente</p>
        </CardContent></Card>
      </div>

      {/* Actions */}
      <Button size="lg" className="w-full h-14 text-lg gap-3" onClick={() => navigate('/app/caisse')}>
        <Scan className="h-6 w-6" /> Ouvrir la Caisse
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-12 gap-2">
              <History className="h-4 w-4" /> Mon historique
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Ventes du jour</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2 overflow-y-auto max-h-[70vh]">
              {metrics.todaySales.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune vente aujourd'hui</p>
              )}
              {metrics.todaySales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(sale.sale_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-muted-foreground">{sale.payment_method || 'Espèces'}</p>
                  </div>
                  <p className="font-bold text-sm">{formatCurrency(sale.total_amount)}</p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/profile')}>
          <User className="h-4 w-4" /> Mon Profil
        </Button>
      </div>
    </div>
  );
}
