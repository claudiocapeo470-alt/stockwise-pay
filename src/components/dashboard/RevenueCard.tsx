import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrendingUp, TrendingDown, CalendarIcon, DollarSign, Minus } from "lucide-react";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears, parseISO, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useSales } from "@/hooks/useSales";

type PeriodType = "today" | "month" | "year" | "custom";

export function RevenueCard() {
  const { sales } = useSales();
  const [period, setPeriod] = useState<PeriodType>("year");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Calculer la plage de dates actuelle et précédente
  const { currentRange, previousRange, periodLabel } = useMemo(() => {
    const now = new Date();
    let current: { from: Date; to: Date };
    let previous: { from: Date; to: Date };
    let label: string;

    switch (period) {
      case "today":
        current = { from: startOfDay(now), to: endOfDay(now) };
        previous = { from: startOfDay(subDays(now, 1)), to: endOfDay(subDays(now, 1)) };
        label = `Aujourd'hui (${format(now, "d MMMM yyyy", { locale: fr })})`;
        break;
      case "month":
        current = { from: startOfMonth(now), to: endOfMonth(now) };
        previous = { from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) };
        label = `${format(now, "MMMM yyyy", { locale: fr })}`;
        break;
      case "year":
        current = { from: startOfYear(now), to: endOfYear(now) };
        previous = { from: startOfYear(subYears(now, 1)), to: endOfYear(subYears(now, 1)) };
        label = `Année ${format(now, "yyyy")}`;
        break;
      case "custom":
        if (dateRange?.from && dateRange?.to) {
          current = { from: startOfDay(dateRange.from), to: endOfDay(dateRange.to) };
          const diffMs = current.to.getTime() - current.from.getTime();
          const previousStart = new Date(current.from.getTime() - diffMs - 86400000);
          const previousEnd = new Date(current.from.getTime() - 86400000);
          previous = { from: startOfDay(previousStart), to: endOfDay(previousEnd) };
          label = `Du ${format(dateRange.from, "d MMM", { locale: fr })} au ${format(dateRange.to, "d MMM yyyy", { locale: fr })}`;
        } else {
          current = { from: startOfYear(now), to: endOfYear(now) };
          previous = { from: startOfYear(subYears(now, 1)), to: endOfYear(subYears(now, 1)) };
          label = `Année ${format(now, "yyyy")}`;
        }
        break;
      default:
        current = { from: startOfYear(now), to: endOfYear(now) };
        previous = { from: startOfYear(subYears(now, 1)), to: endOfYear(subYears(now, 1)) };
        label = `Année ${format(now, "yyyy")}`;
    }

    return { currentRange: current, previousRange: previous, periodLabel: label };
  }, [period, dateRange]);

  // Calculer le chiffre d'affaires pour une période donnée
  const calculateRevenue = (range: { from: Date; to: Date }) => {
    if (!sales || sales.length === 0) return 0;
    
    return sales
      .filter(sale => {
        const saleDate = parseISO(sale.sale_date);
        return isWithinInterval(saleDate, { start: range.from, end: range.to });
      })
      .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  };

  // Calcul du CA actuel et précédent
  const currentRevenue = useMemo(() => calculateRevenue(currentRange), [sales, currentRange]);
  const previousRevenue = useMemo(() => calculateRevenue(previousRange), [sales, previousRange]);

  // Calcul du pourcentage de changement
  const { percentChange, changeType, changeLabel } = useMemo(() => {
    if (previousRevenue === 0) {
      return { 
        percentChange: null, 
        changeType: "neutral" as const, 
        changeLabel: currentRevenue > 0 ? "Nouveau" : "—" 
      };
    }
    
    const change = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    return {
      percentChange: change,
      changeType: change >= 0 ? "positive" as const : "negative" as const,
      changeLabel: `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs période précédente`
    };
  }, [currentRevenue, previousRevenue]);

  // Formatage du montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="relative overflow-hidden border-2 border-success/30 bg-gradient-to-br from-card via-card to-success/5 hover:shadow-lg hover:shadow-success/10 transition-all duration-300">
      {/* Bordure lumineuse supérieure */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-success via-emerald-400 to-success" />
      
      {/* Effet de brillance */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-success/10 rounded-full blur-3xl" />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/10">
              <DollarSign className="h-4 w-4 text-success" />
            </div>
            Chiffre d'Affaires
          </CardTitle>
          
          {/* Sélecteur de période */}
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v: PeriodType) => setPeriod(v)}>
              <SelectTrigger className="h-8 w-[120px] text-xs border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
            
            {period === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <CalendarIcon className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        {/* Période affichée */}
        <p className="text-xs text-muted-foreground mb-2">{periodLabel}</p>
        
        {/* Montant principal */}
        <div className="text-3xl sm:text-4xl font-black text-success mb-3">
          {formatAmount(currentRevenue)} <span className="text-lg font-semibold">FCFA</span>
        </div>
        
        {/* Comparaison avec période précédente */}
        <div className="flex items-center gap-2 text-sm">
          {changeType === "positive" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>{changeLabel}</span>
            </div>
          )}
          {changeType === "negative" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-medium">
              <TrendingDown className="h-4 w-4" />
              <span>{changeLabel}</span>
            </div>
          )}
          {changeType === "neutral" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
              <Minus className="h-4 w-4" />
              <span>{changeLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
