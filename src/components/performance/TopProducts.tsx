import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Package, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
}

interface TopProductsProps {
  sales: Sale[];
  products: Product[];
}

export function TopProducts({ sales, products }: TopProductsProps) {
  const topProductsData = useMemo(() => {
    if (!sales || !products) return { topSelling: [], topRevenue: [], topMargin: [] };

    // Grouper les ventes par produit
    const productStats = sales.reduce((acc, sale) => {
      if (!acc[sale.product_id]) {
        acc[sale.product_id] = {
          quantity: 0,
          revenue: 0,
          salesCount: 0
        };
      }
      acc[sale.product_id].quantity += sale.quantity;
      acc[sale.product_id].revenue += Number(sale.total_amount);
      acc[sale.product_id].salesCount += 1;
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number; salesCount: number; }>);

    // Enrichir avec les informations produit
    const enrichedStats = Object.entries(productStats).map(([productId, stats]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;

      const margin = stats.revenue * 0.4; // Marge estimée à 40%
      const averageOrderValue = stats.revenue / stats.salesCount;

      return {
        id: productId,
        name: product.name,
        price: product.price,
        quantity: stats.quantity,
        revenue: stats.revenue,
        margin,
        salesCount: stats.salesCount,
        averageOrderValue
      };
    }).filter(Boolean);

    // Top produits par quantité vendue
    const topSelling = [...enrichedStats]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Top produits par chiffre d'affaires
    const topRevenue = [...enrichedStats]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top produits par marge
    const topMargin = [...enrichedStats]
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);

    return { topSelling, topRevenue, topMargin };
  }, [sales, products]);

  const renderProductList = (products: any[], title: string, valueKey: string, icon: any) => {
    const maxValue = products.length > 0 ? Math.max(...products.map(p => p[valueKey])) : 0;

    return (
      <Card className="bg-gradient-surface border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-foreground">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune donnée disponible
            </p>
          ) : (
            products.map((product, index) => (
              <div key={product.id} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <Badge variant="secondary" className="ml-2">
                      {valueKey === 'quantity' && `${product.quantity} vendus`}
                      {valueKey === 'revenue' && formatCurrency(product.revenue)}
                      {valueKey === 'margin' && formatCurrency(product.margin)}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={maxValue > 0 ? (product[valueKey] / maxValue) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{product.salesCount} ventes</span>
                    <span>Moy: {formatCurrency(product.averageOrderValue)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {renderProductList(
        topProductsData.topSelling,
        "Produits les Plus Vendus",
        "quantity",
        <Package className="mr-2 h-5 w-5 text-primary" />
      )}
      {renderProductList(
        topProductsData.topRevenue,
        "Top Chiffre d'Affaires",
        "revenue",
        <TrendingUp className="mr-2 h-5 w-5 text-success" />
      )}
      {renderProductList(
        topProductsData.topMargin,
        "Meilleures Marges",
        "margin",
        <Trophy className="mr-2 h-5 w-5 text-warning" />
      )}
    </div>
  );
}