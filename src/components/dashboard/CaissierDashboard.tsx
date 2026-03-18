import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scan, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { useSales } from '@/hooks/useSales';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export function CaissierDashboard() {
  const { sales } = useSales();
  const { memberInfo } = useAuth();
  const navigate = useNavigate();
  const firstName = memberInfo?.member_first_name || 'Caissier';

  const metrics = useMemo(() => {
    const today = new Date();
    const todaySales = sales.filter(s =>
      new Date(s.sale_date).toDateString() === today.toDateString()
    );
    const total = todaySales.reduce((s, v) => s + v.total_amount, 0);
    return {
      count: todaySales.length,
      total,
      avg: todaySales.length ? Math.round(total / todaySales.length) : 0,
      lastSaleTime: todaySales.length
        ? new Date(todaySales[todaySales.length - 1].sale_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : null,
    };
  }, [sales]);

  return (
    <div className='space-y-6 animate-fade-in'>
      <div>
        <h1 className='text-2xl font-bold'>Bonjour, {firstName} 👋</h1>
        <p className='text-sm text-muted-foreground'>Vos statistiques du jour</p>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <Card><CardContent className='p-5 text-center'>
          <TrendingUp className='h-7 w-7 text-primary mx-auto mb-2' />
          <p className='text-2xl font-bold'>{metrics.total.toLocaleString()}</p>
          <p className='text-xs text-muted-foreground'>FCFA encaissés</p>
        </CardContent></Card>
        <Card><CardContent className='p-5 text-center'>
          <ShoppingCart className='h-7 w-7 text-green-500 mx-auto mb-2' />
          <p className='text-2xl font-bold'>{metrics.count}</p>
          <p className='text-xs text-muted-foreground'>Transactions</p>
        </CardContent></Card>
        <Card><CardContent className='p-5 text-center'>
          <TrendingUp className='h-7 w-7 text-blue-500 mx-auto mb-2' />
          <p className='text-2xl font-bold'>{metrics.avg.toLocaleString()}</p>
          <p className='text-xs text-muted-foreground'>Panier moyen FCFA</p>
        </CardContent></Card>
        <Card><CardContent className='p-5 text-center'>
          <Clock className='h-7 w-7 text-orange-500 mx-auto mb-2' />
          <p className='text-lg font-bold'>{metrics.lastSaleTime || '--:--'}</p>
          <p className='text-xs text-muted-foreground'>Dernière vente</p>
        </CardContent></Card>
      </div>
      <Button size='lg' className='w-full h-14 text-lg gap-3' onClick={() => navigate('/app/caisse')}>
        <Scan className='h-6 w-6' /> Ouvrir la Caisse
      </Button>
    </div>
  );
}
