import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Target, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MetricsProps {
  metrics: {
    totalSales: number;
    totalRevenue: number;
    totalPayments: number;
    grossMargin: number;
  };
}

export function PerformanceMetrics({ metrics }: MetricsProps) {
  const metricsData = [
    {
      title: "Ventes Totales",
      value: metrics.totalSales.toString(),
      icon: ShoppingCart,
      gradient: "primary",
      change: "+12%",
      changeType: "positive" as const
    },
    {
      title: "Chiffre d'Affaires",
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      gradient: "success" as const,
      change: "+8.2%",
      changeType: "positive" as const
    },
    {
      title: "Marge Brute",
      value: formatCurrency(metrics.grossMargin),
      icon: Target,
      gradient: "warning" as const,
      change: "+5.4%",
      changeType: "positive" as const
    },
    {
      title: "Paiements Reçus",
      value: formatCurrency(metrics.totalPayments),
      icon: CreditCard,
      gradient: "primary" as const,
      change: "+15.7%",
      changeType: "positive" as const
    }
  ];

  const gradientClasses = {
    primary: "bg-gradient-primary",
    success: "bg-gradient-success", 
    warning: "bg-gradient-warning"
  };

  const changeClasses = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground"
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metricsData.map((metric, index) => (
        <Card key={index} className="relative overflow-hidden transition-all hover:shadow-medium bg-gradient-surface border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${gradientClasses[metric.gradient]}`}>
              <metric.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">
              {metric.value}
            </div>
            {metric.change && (
              <div className="flex items-center text-xs">
                {metric.changeType === "positive" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                )}
                <span className={changeClasses[metric.changeType]}>
                  {metric.change} vs période précédente
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}