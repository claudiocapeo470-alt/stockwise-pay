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
      <Card className="hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl shrink-0">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Chiffre d'affaires</CardTitle>
                <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', notation: 'compact', compactDisplay: 'short' }).format(totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <ChartContainer config={chartConfig} className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient2026" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revenueGradient2026)" dot={false} activeDot={{ r: 5, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Nombre de ventes */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 bg-success/10 flex items-center justify-center rounded-xl shrink-0">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Nombre de ventes</CardTitle>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{totalSales} <span className="text-sm font-normal text-muted-foreground">ventes</span></p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <ChartContainer config={chartConfig} className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="25%" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
});
