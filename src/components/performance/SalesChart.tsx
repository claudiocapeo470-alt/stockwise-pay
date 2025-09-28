import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from "recharts";
import { format, parseISO, startOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp } from "lucide-react";
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

export function SalesChart({ sales, period, dateRange }: SalesChartProps) {
  const chartData = useMemo(() => {
    if (!sales || sales.length === 0) return [];

    const { from, to } = dateRange;
    let intervals: Date[] = [];
    let formatString = "";

    // Définir les intervalles selon la période
    switch (period) {
      case "today":
        // Pour aujourd'hui, on groupe par heure
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
        // Pour aujourd'hui, filtrer par heure
        salesInInterval = sales.filter(sale => {
          const saleDate = parseISO(sale.sale_date);
          return saleDate.getHours() === intervalDate.getHours() &&
                 startOfDay(saleDate).getTime() === startOfDay(intervalDate).getTime();
        });
      } else {
        // Pour les autres périodes, filtrer par jour/semaine
        salesInInterval = sales.filter(sale => {
          const saleDate = parseISO(sale.sale_date);
          if (period === "week" || period === "month" || (period === "custom" && formatString.includes("dd"))) {
            return startOfDay(saleDate).getTime() === startOfDay(intervalDate).getTime();
          } else {
            // Pour les semaines
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
    <div className="grid gap-6 md:grid-cols-2">
      {/* Évolution du chiffre d'affaires */}
      <Card className="bg-gradient-surface border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-foreground">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Évolution du Chiffre d'Affaires
          </CardTitle>
          <div className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF'
            }).format(totalRevenue)}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Nombre de ventes */}
      <Card className="bg-gradient-surface border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-foreground">
            <TrendingUp className="mr-2 h-5 w-5 text-success" />
            Nombre de Ventes
          </CardTitle>
          <div className="text-2xl font-bold text-success">
            {totalSales} ventes
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--success))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}