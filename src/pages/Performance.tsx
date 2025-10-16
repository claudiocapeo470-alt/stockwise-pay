import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import { PerformanceMetrics } from "@/components/performance/PerformanceMetrics";
import { SalesChart } from "@/components/performance/SalesChart";
import { TopProducts } from "@/components/performance/TopProducts";
import { TopCustomers } from "@/components/performance/TopCustomers";
import { DateRange } from "react-day-picker";
import { exportToPDF, exportToExcel } from "@/lib/exportUtils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useIsMobile } from "@/hooks/use-mobile";

type PeriodType = "today" | "week" | "month" | "custom";

export default function Performance() {
  const [period, setPeriod] = useState<PeriodType>("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const isMobile = useIsMobile();

  const { products, isLoading: productsLoading } = useProducts();
  const { sales, isLoading: salesLoading } = useSales();
  const { payments, isLoading: paymentsLoading } = usePayments();

  const isLoading = productsLoading || salesLoading || paymentsLoading;

  // Calcul de la période de dates
  const getDateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case "today":
        return { from: startOfDay(now), to: endOfDay(now) };
      case "week":
        return { from: startOfWeek(now, { locale: fr }), to: endOfWeek(now, { locale: fr }) };
      case "month":
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case "custom":
        return dateRange?.from && dateRange?.to 
          ? { from: startOfDay(dateRange.from), to: endOfDay(dateRange.to) }
          : { from: startOfMonth(now), to: endOfMonth(now) };
      default:
        return { from: startOfMonth(now), to: endOfMonth(now) };
    }
  }, [period, dateRange]);

  // Filtrage des données selon les critères
  const filteredData = useMemo(() => {
    if (!sales || !products || !payments) return { sales: [], products: [], payments: [] };

    const { from, to } = getDateRange;
    
    let filteredSales = sales.filter(sale => {
      const saleDate = parseISO(sale.sale_date);
      const inDateRange = isWithinInterval(saleDate, { start: from, end: to });
      const matchesProduct = selectedProduct === "all" || sale.product_id === selectedProduct;
      const matchesCustomer = selectedCustomer === "all" || sale.customer_name?.toLowerCase().includes(selectedCustomer.toLowerCase());
      
      return inDateRange && matchesProduct && matchesCustomer;
    });

    let filteredPayments = payments.filter(payment => {
      const paymentDate = parseISO(payment.payment_date);
      const inDateRange = isWithinInterval(paymentDate, { start: from, end: to });
      const matchesCustomer = selectedCustomer === "all" || 
        payment.customer_first_name?.toLowerCase().includes(selectedCustomer.toLowerCase()) ||
        payment.customer_last_name?.toLowerCase().includes(selectedCustomer.toLowerCase());
      
      return inDateRange && matchesCustomer;
    });

    return {
      sales: filteredSales,
      products: products,
      payments: filteredPayments
    };
  }, [sales, products, payments, getDateRange, selectedProduct, selectedCustomer]);

  // Calcul des métriques
  const metrics = useMemo(() => {
    const { sales: filteredSales, payments: filteredPayments } = filteredData;
    
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    const totalPayments = filteredPayments.reduce((sum, payment) => sum + Number(payment.paid_amount), 0);
    
    // Calcul de la marge brute (simplifié : revenus - coûts estimés à 60% du prix de vente)
    const grossMargin = totalRevenue * 0.4; // Supposons 40% de marge
    
    return {
      totalSales,
      totalRevenue,
      totalPayments,
      grossMargin
    };
  }, [filteredData]);

  // Fonction d'export
  const handleExport = async (exportFormat: 'pdf' | 'excel') => {
    const data = {
      metrics,
      sales: filteredData.sales,
      products: filteredData.products,
      payments: filteredData.payments,
      period: period,
      dateRange: getDateRange
    };

    if (exportFormat === 'pdf') {
      await exportToPDF(data, `rapport-performance-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.pdf`);
    } else {
      await exportToExcel(data, `rapport-performance-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.xlsx`);
    }
  };

  // Obtenir la liste unique des clients
  const uniqueCustomers = useMemo(() => {
    const customers = new Set<string>();
    sales?.forEach(sale => {
      if (sale.customer_name) customers.add(sale.customer_name);
    });
    payments?.forEach(payment => {
      if (payment.customer_first_name && payment.customer_last_name) {
        customers.add(`${payment.customer_first_name} ${payment.customer_last_name}`);
      }
    });
    return Array.from(customers);
  }, [sales, payments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-full overflow-hidden">
      {/* En-tête */}
      <div className="flex flex-col space-y-3 sm:space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-secondary bg-clip-text text-transparent truncate">
            {isMobile ? "Performance" : "Tableau de bord Performance"}
          </h2>
          <p className="text-sm text-muted-foreground truncate">
            {isMobile ? "Indicateurs clés" : "Visualisez vos indicateurs clés de performance en temps réel"}
          </p>
        </div>
        <div className="flex flex-row gap-2 shrink-0">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "sm"}
            onClick={() => handleExport('pdf')}
            className="border-primary/20 hover:border-primary flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "sm"}
            onClick={() => handleExport('excel')}
            className="border-primary/20 hover:border-primary flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-sm sm:text-base text-blue-900 dark:text-blue-100">
            <Activity className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span className="truncate">Filtres d'analyse</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Période */}
            <div className="space-y-2 min-w-0">
              <label className="text-xs sm:text-sm font-medium text-foreground">Période</label>
              <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
                <SelectTrigger className="bg-input border-border h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-[200px]">
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="custom">Personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date personnalisée */}
            {period === "custom" && (
              <div className="space-y-2 min-w-0 sm:col-span-2 lg:col-span-1">
                <label className="text-xs sm:text-sm font-medium text-foreground">Dates</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-input border-border h-9 text-xs sm:text-sm"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate">
                        {dateRange?.from ? (
                          dateRange.to ? (
                            isMobile ? (
                              `${format(dateRange.from, "dd/MM", { locale: fr })} - ${format(dateRange.to, "dd/MM", { locale: fr })}`
                            ) : (
                              <>
                                {format(dateRange.from, "dd MMM", { locale: fr })} - {format(dateRange.to, "dd MMM", { locale: fr })}
                              </>
                            )
                          ) : (
                            format(dateRange.from, isMobile ? "dd/MM/yy" : "dd MMM y", { locale: fr })
                          )
                        ) : (
                          <span>Sélectionner</span>
                        )}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={isMobile ? 1 : 2}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Filtre produit */}
            <div className="space-y-2 min-w-0">
              <label className="text-xs sm:text-sm font-medium text-foreground">Produit</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="bg-input border-border h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-[200px]">
                  <SelectItem value="all">Tous</SelectItem>
                  {products?.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      <span className="truncate">{product.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre client */}
            <div className="space-y-2 min-w-0">
              <label className="text-xs sm:text-sm font-medium text-foreground">Client</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="bg-input border-border h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-[200px]">
                  <SelectItem value="all">Tous</SelectItem>
                  {uniqueCustomers.map(customer => (
                    <SelectItem key={customer} value={customer}>
                      <span className="truncate">{customer}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques principales */}
      <PerformanceMetrics metrics={metrics} />

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="bg-card border border-border w-full sm:w-auto grid grid-cols-3 sm:flex">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2 sm:px-4"
          >
            {isMobile ? "Vue" : "Vue d'ensemble"}
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2 sm:px-4"
          >
            Produits
          </TabsTrigger>
          <TabsTrigger 
            value="customers" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2 sm:px-4"
          >
            Clients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SalesChart 
            sales={filteredData.sales} 
            period={period}
            dateRange={getDateRange}
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <TopProducts 
            sales={filteredData.sales} 
            products={filteredData.products}
          />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <TopCustomers 
            sales={filteredData.sales} 
            payments={filteredData.payments}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}