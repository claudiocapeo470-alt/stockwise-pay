import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, BarChart3, PieChart, Calendar } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import { useMemo } from "react";

interface ReportDialogProps {
  reportType: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ reportType, open, onOpenChange }: ReportDialogProps) {
  const { products = [] } = useProducts();
  const { sales = [] } = useSales();
  const { payments = [] } = usePayments();

  const reportData = useMemo(() => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity);
    const outOfStockProducts = products.filter(p => p.quantity === 0);
    const completedPayments = payments.filter(p => p.status === 'completed');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const overduePayments = payments.filter(p => p.status === 'overdue');

    return {
      sales: {
        total: totalSales,
        revenue: totalRevenue,
        todaySales: sales.filter(s => {
          const today = new Date();
          const saleDate = new Date(s.sale_date);
          return saleDate.toDateString() === today.toDateString();
        }).length,
        topProducts: products
          .map(product => ({
            ...product,
            salesCount: sales.filter(s => s.product_id === product.id).length,
            salesRevenue: sales
              .filter(s => s.product_id === product.id)
              .reduce((sum, s) => sum + Number(s.total_amount), 0)
          }))
          .sort((a, b) => b.salesRevenue - a.salesRevenue)
          .slice(0, 5)
      },
      inventory: {
        totalProducts,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
        lowStockProducts,
        outOfStockProducts,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
      },
      payments: {
        total: payments.length,
        completed: completedPayments.length,
        pending: pendingPayments.length,
        overdue: overduePayments.length,
        totalPaid: completedPayments.reduce((sum, p) => sum + Number(p.total_amount), 0),
        totalPending: pendingPayments.reduce((sum, p) => sum + Number(p.total_amount), 0),
        totalOverdue: overduePayments.reduce((sum, p) => sum + Number(p.total_amount), 0)
      }
    };
  }, [products, sales, payments]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price).replace('XOF', 'CFA');
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'sales': return 'Rapport des ventes';
      case 'inventory': return 'Rapport des stocks';
      case 'payments': return 'Rapport des paiements';
      default: return 'Rapport';
    }
  };

  const getReportIcon = () => {
    switch (reportType) {
      case 'sales': return <TrendingUp className="h-5 w-5" />;
      case 'inventory': return <BarChart3 className="h-5 w-5" />;
      case 'payments': return <PieChart className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const renderSalesReport = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ventes totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.sales.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ventes aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{reportData.sales.todaySales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">{formatPrice(reportData.sales.revenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top des produits vendus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reportData.sales.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatPrice(product.salesRevenue)}</div>
                  <div className="text-sm text-muted-foreground">{product.salesCount} vente(s)</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.inventory.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Stock bas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{reportData.inventory.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Épuisé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{reportData.inventory.outOfStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Valeur stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">{formatPrice(reportData.inventory.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {reportData.inventory.lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-warning">Produits en stock bas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reportData.inventory.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-warning/10 rounded">
                  <span className="font-medium">{product.name}</span>
                  <div className="text-right">
                    <div className="font-medium">Stock: {product.quantity}</div>
                    <div className="text-sm text-muted-foreground">Min: {product.min_quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reportData.inventory.outOfStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Produits épuisés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reportData.inventory.outOfStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="destructive">Épuisé</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPaymentsReport = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.payments.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Complétés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{reportData.payments.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{reportData.payments.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{reportData.payments.overdue}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-success">Montant encaissé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-success">{formatPrice(reportData.payments.totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-warning">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-warning">{formatPrice(reportData.payments.totalPending)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive">En retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-destructive">{formatPrice(reportData.payments.totalOverdue)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (reportType) {
      case 'sales': return renderSalesReport();
      case 'inventory': return renderInventoryReport();
      case 'payments': return renderPaymentsReport();
      default: return <div>Type de rapport non supporté</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getReportIcon()}
            {getReportTitle()}
            <Badge variant="secondary" className="ml-auto">
              {new Date().toLocaleDateString('fr-FR')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {renderReportContent()}
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                // Export functionality can be added here
                console.log('Export report:', reportType);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}