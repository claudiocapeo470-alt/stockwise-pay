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
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* En-tête avec design moderne */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/20 p-4 sm:p-6 shadow-glow">
        {/* Blobs d'arrière-plan animés */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight bg-gradient-secondary bg-clip-text text-transparent flex items-center gap-3">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-pulse" />
              {isMobile ? "Performance" : "Tableau de bord Performance"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 font-medium">
              {isMobile ? "Indicateurs clés" : "✨ Visualisez vos indicateurs clés de performance en temps réel"}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={() => handleExport('pdf')}
              className="border-primary/30 bg-card/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-soft hover:shadow-glow"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              {!isMobile && "PDF"}
            </Button>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={() => handleExport('excel')}
              className="border-accent/30 bg-card/80 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 shadow-soft hover:shadow-purple-glow"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              {!isMobile && "Excel"}
            </Button>
          </div>
        </div>
      </div>

      {/* Filtres avec design moderne */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-card border-primary/20 shadow-medium hover:shadow-glow transition-all duration-500">
        {/* Effet de lumière subtile */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-secondary"></div>
        
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-base sm:text-lg font-bold">
            <div className="p-2 rounded-lg bg-primary/10 mr-3">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="bg-gradient-secondary bg-clip-text text-transparent">Filtres d'analyse</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {/* Période */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Période</label>
              <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border hover:border-primary transition-colors shadow-soft">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="custom">Personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date personnalisée */}
            {period === "custom" && (
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dates</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-background/50 backdrop-blur-sm border-border hover:border-primary transition-colors shadow-soft"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd MMM", { locale: fr })} - {format(dateRange.to, "dd MMM", { locale: fr })}
                          </>
                        ) : (
                          format(dateRange.from, "dd MMM y", { locale: fr })
                        )
                      ) : (
                        <span>Sélectionner</span>
                      )}
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
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Produit</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border hover:border-primary transition-colors shadow-soft">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {products?.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre client */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Client</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border hover:border-primary transition-colors shadow-soft">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {uniqueCustomers.map(customer => (
                    <SelectItem key={customer} value={customer}>
                      {customer}
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

      {/* Contenu principal avec onglets modernes */}
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="bg-card/50 backdrop-blur-sm border-2 border-border shadow-medium grid grid-cols-3 p-1 h-auto">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-secondary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 rounded-md font-semibold text-xs sm:text-sm py-2"
          >
            {isMobile ? "Vue" : "Vue d'ensemble"}
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="data-[state=active]:bg-gradient-secondary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 rounded-md font-semibold text-xs sm:text-sm py-2"
          >
            Produits
          </TabsTrigger>
          <TabsTrigger 
            value="customers" 
            className="data-[state=active]:bg-gradient-secondary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 rounded-md font-semibold text-xs sm:text-sm py-2"
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