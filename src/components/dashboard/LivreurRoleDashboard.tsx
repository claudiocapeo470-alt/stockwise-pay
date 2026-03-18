import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDeliveries } from '@/hooks/useDeliveries';

export function LivreurRoleDashboard() {
  const { memberInfo } = useAuth();
  const navigate = useNavigate();
  const { deliveries } = useDeliveries();
  const firstName = memberInfo?.member_first_name || 'Livreur';

  const today = new Date().toDateString();
  const pending = deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length;
  const inProgress = deliveries.filter(d => d.status === 'in_progress').length;
  const todayDone = deliveries.filter(d =>
    d.status === 'delivered' && d.delivered_at && new Date(d.delivered_at).toDateString() === today
  ).length;

  return (
    <div className='space-y-6 animate-fade-in'>
      <div>
        <h1 className='text-2xl font-bold'>Bonjour, {firstName} 👋</h1>
        <p className='text-sm text-muted-foreground'>Vos livraisons du jour</p>
      </div>
      <div className='grid grid-cols-3 gap-4'>
        <Card><CardContent className='p-5 text-center'>
          <Clock className='h-7 w-7 text-yellow-500 mx-auto mb-2' />
          <p className='text-2xl font-bold'>{pending}</p>
          <p className='text-xs text-muted-foreground'>À récupérer</p>
        </CardContent></Card>
        <Card><CardContent className='p-5 text-center'>
          <Truck className='h-7 w-7 text-primary mx-auto mb-2' />
          <p className='text-2xl font-bold'>{inProgress}</p>
          <p className='text-xs text-muted-foreground'>En livraison</p>
        </CardContent></Card>
        <Card><CardContent className='p-5 text-center'>
          <CheckCircle className='h-7 w-7 text-green-500 mx-auto mb-2' />
          <p className='text-2xl font-bold'>{todayDone}</p>
          <p className='text-xs text-muted-foreground'>Livrées</p>
        </CardContent></Card>
      </div>
      <Button className='w-full h-14 text-lg gap-3' onClick={() => navigate('/app/livreur')}>
        <Truck className='h-6 w-6' /> Voir mes livraisons
      </Button>
    </div>
  );
}
