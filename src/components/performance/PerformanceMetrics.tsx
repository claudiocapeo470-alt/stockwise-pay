import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Target, Wallet } from "lucide-react";
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
      icon: ShoppingBag,
      gradient: "primary",
      bgGradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800/40",
      iconBg: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      topBorder: "from-blue-500 to-blue-600",
      change: "+12%",
      changeType: "positive" as const
    },
    {
      title: "Chiffre d'Affaires",
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      gradient: "success" as const,
      bgGradient: "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800/40",
      iconBg: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      topBorder: "from-emerald-500 to-emerald-600",
      change: "+8.2%",
      changeType: "positive" as const
    },
    {
      title: "Marge Brute",
      value: formatCurrency(metrics.grossMargin),
      icon: Target,
      gradient: "warning" as const,
      bgGradient: "from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800/40",
      iconBg: "bg-orange-500",
      textColor: "text-orange-600 dark:text-orange-400",
      topBorder: "from-orange-500 to-orange-600",
      change: "+5.4%",
      changeType: "positive" as const
    },
    {
      title: "Paiements Reçus",
      value: formatCurrency(metrics.totalPayments),
      icon: Wallet,
      gradient: "primary" as const,
      bgGradient: "from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20",
      borderColor: "border-violet-200 dark:border-violet-800/40",
      iconBg: "bg-violet-500",
      textColor: "text-violet-600 dark:text-violet-400",
      topBorder: "from-violet-500 to-violet-600",
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
          className={`relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br ${metric.bgGradient} border-2 ${metric.borderColor} hover:shadow-lg`}
        >
          {/* Bordure lumineuse supérieure */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${metric.topBorder}`}></div>
          
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3 pt-5">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
              {metric.title}
            </CardTitle>
            <div className={`p-2.5 rounded-xl ${metric.iconBg} shadow-md group-hover:scale-110 transition-transform duration-300`}>
              <metric.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className={`text-2xl sm:text-3xl font-black ${metric.textColor} mb-2`}>
              {metric.value}
            </div>
            {metric.change && (
              <div className="flex items-center text-xs sm:text-sm font-medium">
                {metric.changeType === "positive" ? (
                  <TrendingUp className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
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