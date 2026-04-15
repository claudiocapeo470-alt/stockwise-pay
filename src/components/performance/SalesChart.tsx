import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from "recharts";
import { format, parseISO, startOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, BarChart3 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface Sale {
  id: string;
  sale_date: string;
  total_amount: number;
  quantity: number;
}

interface SalesChartProps {
  sales: Sale[];
  period: "today" | "week" | "month" | "custom";
  dateRange: { from: Date; to: Date };
}

const chartConfig = {
  revenue: {
    label: "Chiffre d'affaires",
    color: "hsl(var(--primary))",
  },
  quantity: {
    label: "Quantité vendue",
    color: "hsl(var(--accent))",
  },
  count: {
    label: "Nombre de ventes",
    color: "hsl(var(--success))",
  },
};

export const SalesChart = React.memo(function SalesChart({ sales, period, dateRange }: SalesChartProps) {
  const chartData = useMemo(() => {
    if (!sales || sales.length === 0) return [];

    const { from, to } = dateRange;
    let intervals: Date[] = [];
    let formatString = "";

    // Définir les intervalles selon la période
    switch (period) {
      case "today":
        intervals = Array.from({ length: 24 }, (_, i) => {
          const date = new Date(from);
          date.setHours(i);
          return date;
        });
        formatString = "HH'h'";
        break;
      case "week":
        intervals = eachDayOfInterval({ start: from, end: to });
        formatString = "EEE dd";
        break;
      case "month":
        intervals = eachDayOfInterval({ start: from, end: to });
        formatString = "dd MMM";
        break;
      case "custom":
        const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          intervals = eachDayOfInterval({ start: from, end: to });
          formatString = "EEE dd";
        } else if (diffDays <= 31) {
          intervals = eachDayOfInterval({ start: from, end: to });
          formatString = "dd MMM";
        } else {
          intervals = eachWeekOfInterval({ start: from, end: to });
          formatString = "'S'w";
        }
        break;
    }

    // Grouper les ventes par intervalle
    return intervals.map(intervalDate => {
      let salesInInterval: Sale[] = [];

      if (period === "today") {
        salesInInterval = sales.filter(sale => {
          const saleDate = parseISO(sale.sale_date);
          return saleDate.getHours() === intervalDate.getHours() &&
                 startOfDay(saleDate).getTime() === startOfDay(intervalDate).getTime();
        });
      } else {
        salesInInterval = sales.filter(sale => {
          const saleDate = parseISO(sale.sale_date);
          if (period === "week" || period === "month" || (period === "custom" && formatString.includes("dd"))) {
            return startOfDay(saleDate).getTime() === startOfDay(intervalDate).getTime();
          } else {
            const saleWeekStart = startOfDay(saleDate);
            saleWeekStart.setDate(saleWeekStart.getDate() - saleWeekStart.getDay());
            const intervalWeekStart = startOfDay(intervalDate);
            intervalWeekStart.setDate(intervalWeekStart.getDate() - intervalWeekStart.getDay());
            return saleWeekStart.getTime() === intervalWeekStart.getTime();
          }
        });
      }

      const revenue = salesInInterval.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
      const quantity = salesInInterval.reduce((sum, sale) => sum + sale.quantity, 0);
      const count = salesInInterval.length;

      return {
        date: format(intervalDate, formatString, { locale: fr }),
        revenue,
        quantity,
        count,
        fullDate: intervalDate
      };
    });
  }, [sales, period, dateRange]);

  const totalRevenue = chartData.reduce((sum, data) => sum + data.revenue, 0);
  const totalSales = chartData.reduce((sum, data) => sum + data.count, 0);

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
      {/* Évolution du chiffre d'affaires */}
      <Card className="relative overflow-hidden bg-card border-2 border-border/60 border-l-4 border-l-primary hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base sm:text-lg font-bold">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block">Chiffre d'Affaires</span>
              <span className="text-2xl sm:text-3xl font-black text-primary">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  notation: 'compact',
                  compactDisplay: 'short'
                }).format(totalRevenue)}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-[280px] lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient2026" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fill="url(#revenueGradient2026)"
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Nombre de ventes */}
      <Card className="relative overflow-hidden bg-card border-2 border-border/60 border-l-4 border-l-success hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base sm:text-lg font-bold">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-success to-emerald-600 shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block">Nombre de Ventes</span>
              <span className="text-2xl sm:text-3xl font-black text-success">
                {totalSales} ventes
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-[280px] lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <defs>
                  <linearGradient id="barGradient2026" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient2026)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
});
