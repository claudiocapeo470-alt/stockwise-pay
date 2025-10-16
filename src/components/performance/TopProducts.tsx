import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Package, TrendingUp, ShoppingBag } from "lucide-react";
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
      <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/90 border-primary/20 shadow-medium hover:shadow-glow transition-all duration-500 group">
        {/* Bordure supérieure animée */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-secondary"></div>
        
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-base sm:text-lg font-bold">
            <div className="p-2 rounded-lg bg-primary/10 mr-2 group-hover:bg-primary/20 transition-colors">
              {icon}
            </div>
            <span className="truncate">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {products.length === 0 ? (
            <div className="text-muted-foreground text-center py-8 text-sm">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
              Aucune donnée disponible
            </div>
          ) : (
            products.map((product, index) => (
              <div key={product.id} className="group/item hover:bg-muted/30 p-2 rounded-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-secondary shadow-glow flex-shrink-0">
                    <span className="text-sm sm:text-base font-black text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-sm sm:text-base font-semibold text-foreground truncate">
                        {product.name}
                      </p>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0 bg-primary/10 text-primary border-primary/20 font-bold">
                        {valueKey === 'quantity' && `${product.quantity}`}
                        {valueKey === 'revenue' && formatCurrency(product.revenue)}
                        {valueKey === 'margin' && formatCurrency(product.margin)}
                      </Badge>
                    </div>
                    <Progress 
                      value={maxValue > 0 ? (product[valueKey] / maxValue) * 100 : 0} 
                      className="h-2 sm:h-2.5 mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" />
                        {product.salesCount} ventes
                      </span>
                      <span className="font-medium">Moy: {formatCurrency(product.averageOrderValue)}</span>
                    </div>
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
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
      {renderProductList(
        topProductsData.topSelling,
        "Produits les Plus Vendus",
        "quantity",
        <Package className="h-5 w-5 text-primary" />
      )}
      {renderProductList(
        topProductsData.topRevenue,
        "Top Chiffre d'Affaires",
        "revenue",
        <TrendingUp className="h-5 w-5 text-success" />
      )}
      {renderProductList(
        topProductsData.topMargin,
        "Meilleures Marges",
        "margin",
        <Trophy className="h-5 w-5 text-warning" />
      )}
    </div>
  );
}