import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Target, Wallet, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MetricsProps {
  metrics: {
    totalSales: number;
    totalRevenue: number;
    totalPayments: number;
    grossMargin: number;
  };
  previousMetrics?: {
    totalSales: number;
    totalRevenue: number;
    totalPayments: number;
    grossMargin: number;
  };
}

export function PerformanceMetrics({ metrics, previousMetrics }: MetricsProps) {
  // Fonction pour calculer le pourcentage de changement
  const calculateChange = (current: number, previous?: number) => {
    if (!previous || previous === 0) {
      return { value: null, type: "neutral" as const, label: current > 0 ? "Nouveau" : "—" };
    }
    const change = ((current - previous) / previous) * 100;
    return {
      value: change,
      type: change >= 0 ? "positive" as const : "negative" as const,
      label: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`
    };
  };

  const salesChange = calculateChange(metrics.totalSales, previousMetrics?.totalSales);
  const revenueChange = calculateChange(metrics.totalRevenue, previousMetrics?.totalRevenue);
  const marginChange = calculateChange(metrics.grossMargin, previousMetrics?.grossMargin);
  const paymentsChange = calculateChange(metrics.totalPayments, previousMetrics?.totalPayments);

  const metricsData = [
    {
      title: "Ventes Totales",
      value: metrics.totalSales.toString(),
      icon: ShoppingBag,
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      borderAccent: "border-l-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      change: salesChange,
    },
    {
      title: "Chiffre d'Affaires",
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      borderAccent: "border-l-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      change: revenueChange,
    },
    {
      title: "Marge Brute",
      value: formatCurrency(metrics.grossMargin),
      icon: Target,
      iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
      borderAccent: "border-l-orange-500",
      textColor: "text-orange-600 dark:text-orange-400",
      change: marginChange,
    },
    {
      title: "Paiements Reçus",
      value: formatCurrency(metrics.totalPayments),
      icon: Wallet,
      iconBg: "bg-gradient-to-br from-violet-500 to-violet-600",
      borderAccent: "border-l-violet-500",
      textColor: "text-violet-600 dark:text-violet-400",
      change: paymentsChange,
    }
  ];

  return (
    <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
      {metricsData.map((metric, index) => (
        <Card 
          key={index} 
          className={`
            relative overflow-hidden group transition-all duration-300 
            bg-card border-2 border-border/60
            border-l-4 ${metric.borderAccent}
            hover:shadow-xl hover:shadow-primary/5
            hover:-translate-y-1
          `}
        >
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3 pt-5">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`
              p-2.5 rounded-xl ${metric.iconBg} 
              shadow-lg shadow-primary/10
              group-hover:scale-110 group-hover:rotate-3
              transition-all duration-300
            `}>
              <metric.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <div className={`text-2xl sm:text-3xl font-black ${metric.textColor} mb-3`}>
              {metric.value}
            </div>
            
            {/* Indicateur de changement */}
            <div className="flex items-center text-xs sm:text-sm font-medium">
              {metric.change.type === "positive" && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{metric.change.label}</span>
                </div>
              )}
              {metric.change.type === "negative" && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>{metric.change.label}</span>
                </div>
              )}
              {metric.change.type === "neutral" && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  <Minus className="h-3.5 w-3.5" />
                  <span>{metric.change.label}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
