import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign } from "lucide-react";
import { useAdminMetrics } from "@/hooks/useAdmin";

export default function AdminPerformance() {
  const { data: metrics } = useAdminMetrics();

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
