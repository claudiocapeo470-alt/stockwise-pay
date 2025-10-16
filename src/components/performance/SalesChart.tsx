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
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
      {/* Évolution du chiffre d'affaires */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/90 border-primary/20 shadow-medium hover:shadow-glow transition-all duration-500 group">
        {/* Bordure supérieure animée */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-secondary"></div>
        
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base sm:text-lg font-bold">
            <div className="p-2 rounded-lg bg-primary/10 mr-2 group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="truncate">Chiffre d'Affaires</span>
          </CardTitle>
          <div className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-secondary bg-clip-text text-transparent mt-1">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(totalRevenue)}
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Nombre de ventes */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/90 border-success/20 shadow-medium hover:shadow-glow transition-all duration-500 group">
        {/* Bordure supérieure animée */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-success"></div>
        
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base sm:text-lg font-bold">
            <div className="p-2 rounded-lg bg-success/10 mr-2 group-hover:bg-success/20 transition-colors">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <span className="truncate">Nombre de Ventes</span>
          </CardTitle>
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-success mt-1">
            {totalSales} ventes
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--success))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}