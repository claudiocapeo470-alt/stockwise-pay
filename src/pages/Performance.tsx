import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, TrendingUp, ShoppingCart, Receipt, BarChart3 } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import { useAuth } from "@/contexts/AuthContext";
import { SalesChart } from "@/components/performance/SalesChart";
import { TopProducts } from "@/components/performance/TopProducts";
import { TopCustomers } from "@/components/performance/TopCustomers";
import { DateRange } from "react-day-picker";
import { exportToPDF, exportToExcel } from "@/lib/exportUtils";

type PeriodType = "today" | "week" | "month" | "custom";

export default function Performance() {
  const [period, setPeriod] = useState<PeriodType>("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  const { products, isLoading: productsLoading } = useProducts();
  const { sales, isLoading: salesLoading } = useSales();
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { isEmployee, memberInfo } = useAuth();

  const isPersonalView = isEmployee && !(memberInfo?.member_permissions as any)?.all;
  const currentMemberId = memberInfo?.member_id;

  const isLoading = productsLoading || salesLoading || paymentsLoading;

  const getDateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case "today": return { from: startOfDay(now), to: endOfDay(now) };
      case "week": return { from: startOfWeek(now, { locale: fr }), to: endOfWeek(now, { locale: fr }) };
      case "month": return { from: startOfMonth(now), to: endOfMonth(now) };
      case "custom":
        return dateRange?.from && dateRange?.to
          ? { from: startOfDay(dateRange.from), to: endOfDay(dateRange.to) }
          : { from: startOfMonth(now), to: endOfMonth(now) };
      default: return { from: startOfMonth(now), to: endOfMonth(now) };
    }
  }, [period, dateRange]);

  const filteredData = useMemo(() => {
    if (!sales || !products || !payments) return { sales: [], products: [], payments: [] };
    const { from, to } = getDateRange;
    const filteredSales = sales.filter(sale => {
      const saleDate = parseISO(sale.sale_date);
      const inRange = isWithinInterval(saleDate, { start: from, end: to });
      const matchProduct = selectedProduct === "all" || sale.product_id === selectedProduct;
      const matchEmployee = !isPersonalView || sale.created_by_member_id === currentMemberId;
      return inRange && matchProduct && matchEmployee;
    });
    const filteredPayments = payments.filter(payment => {
      const paymentDate = parseISO(payment.payment_date);
      return isWithinInterval(paymentDate, { start: from, end: to });
    });
    return { sales: filteredSales, products, payments: filteredPayments };
  }, [sales, products, payments, getDateRange, selectedProduct, isPersonalView, currentMemberId]);

  const metrics = useMemo(() => {
    const { sales: filteredSales, payments: filteredPayments } = filteredData;
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    const totalPayments = filteredPayments.reduce((sum, payment) => sum + Number(payment.paid_amount), 0);
    const grossMargin = totalRevenue * 0.4;
    return { totalSales, totalRevenue, totalPayments, grossMargin };
  }, [filteredData]);

  const handleExport = async (exportFormat: 'pdf' | 'excel') => {
    const data = { metrics, sales: filteredData.sales, products: filteredData.products, payments: filteredData.payments, period, dateRange: getDateRange };
    if (exportFormat === 'pdf') {
      await exportToPDF(data, `rapport-performance-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.pdf`);
    } else {
      await exportToExcel(data, `rapport-performance-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.xlsx`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Performance</h2>
          <p className="text-sm text-muted-foreground">Suivez l'évolution de votre activité</p>
        </div>
      </div>

      {isPersonalView && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-xs text-primary">
          📊 Vous consultez uniquement vos propres statistiques.
        </div>
      )}

      {/* Stats — style Stocknix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold truncate">{metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Chiffre d'affaires (FCFA)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-success/10 flex items-center justify-center rounded-xl">
              <ShoppingCart className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.totalSales}</p>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-secondary/30 flex items-center justify-center rounded-xl">
              <Receipt className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold truncate">{metrics.totalSales > 0 ? Math.round(metrics.totalRevenue / metrics.totalSales).toLocaleString() : 0}</p>
              <p className="text-xs text-muted-foreground">Panier moyen (FCFA)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-warning/10 flex items-center justify-center rounded-xl">
              <BarChart3 className="h-5 w-5 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold truncate">{Math.round(metrics.grossMargin).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Marge estimée (FCFA)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={(v: PeriodType) => setPeriod(v)}>
            <SelectTrigger className="w-[150px] h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="custom">Personnalisée</SelectItem>
            </SelectContent>
          </Select>
          {period === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-11 gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange?.from && dateRange?.to ? `${format(dateRange.from, "dd/MM")} - ${format(dateRange.to, "dd/MM")}` : "Dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="range" selected={dateRange} onSelect={setDateRange} locale={fr} /></PopoverContent>
            </Popover>
          )}
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-[170px] h-11"><SelectValue placeholder="Produit" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les produits</SelectItem>
              {products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')} className="h-11"><Download className="h-4 w-4 mr-2" />PDF</Button>
          <Button variant="outline" onClick={() => handleExport('excel')} className="h-11"><Download className="h-4 w-4 mr-2" />Excel</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="customers">Clients</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><SalesChart sales={filteredData.sales} period={period} dateRange={getDateRange} /></TabsContent>
        <TabsContent value="products"><TopProducts sales={filteredData.sales} products={filteredData.products} /></TabsContent>
        <TabsContent value="customers"><TopCustomers sales={filteredData.sales} payments={filteredData.payments} /></TabsContent>
      </Tabs>
    </div>
  );
}
