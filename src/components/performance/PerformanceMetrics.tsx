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
    <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metricsData.map((metric, index) => (
        <Card 
          key={index} 
          className="relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-card via-card to-card/90 border-primary/20 shadow-medium hover:shadow-glow hover:border-primary/40"
        >
          {/* Effet de lumière animée */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Bordure lumineuse supérieure */}
          <div className={`absolute top-0 left-0 w-full h-1 ${gradientClasses[metric.gradient]}`}></div>
          
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3 pt-5">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {metric.title}
            </CardTitle>
            <div className={`p-2.5 rounded-xl ${gradientClasses[metric.gradient]} shadow-glow group-hover:scale-110 transition-transform duration-300`}>
              <metric.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl sm:text-3xl font-black bg-gradient-secondary bg-clip-text text-transparent mb-2">
              {metric.value}
            </div>
            {metric.change && (
              <div className="flex items-center text-xs sm:text-sm font-medium">
                {metric.changeType === "positive" ? (
                  <TrendingUp className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-success animate-bounce" />
                ) : (
                  <TrendingDown className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
                )}
                <span className={changeClasses[metric.changeType]}>
                  {metric.change} vs période
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}