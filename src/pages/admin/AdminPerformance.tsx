import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, DollarSign } from "lucide-react";

export default function AdminPerformance() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: activeSubs } = await supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('subscribed', true);
    const { data: sales } = await supabase.from('sales').select('total_amount');
    const revenue = sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0;
    
    setMetrics({ totalUsers, activeSubs, revenue, totalSales: sales?.length || 0 });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Performance & Rapports</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{metrics?.activeSubs || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{metrics?.revenue || 0} XOF</div></CardContent>
        </Card>
      </div>
    </div>
  );
}
