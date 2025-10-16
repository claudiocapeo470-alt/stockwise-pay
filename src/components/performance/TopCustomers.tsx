import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Crown, ShoppingBag, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Sale {
  id: string;
  customer_name?: string;
  total_amount: number;
  quantity: number;
}

interface Payment {
  id: string;
  customer_name?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  paid_amount: number;
}

interface TopCustomersProps {
  sales: Sale[];
  payments: Payment[];
}

export function TopCustomers({ sales, payments }: TopCustomersProps) {
  const topCustomersData = useMemo(() => {
    if (!sales && !payments) return { topFrequent: [], topRevenue: [] };

    // Normaliser les noms de clients
    const normalizeCustomerName = (sale?: Sale, payment?: Payment): string | null => {
      if (sale?.customer_name) return sale.customer_name;
      if (payment?.customer_first_name && payment?.customer_last_name) {
        return `${payment.customer_first_name} ${payment.customer_last_name}`;
      }
      return null;
    };

    // Construire les stats des clients à partir des ventes
    const customerStats: Record<string, {
      frequency: number;
      revenue: number;
      totalQuantity: number;
      lastOrderDate?: string;
      averageOrderValue: number;
    }> = {};

    // Traiter les ventes
    sales?.forEach(sale => {
      const customerName = sale.customer_name;
      if (!customerName) return;

      if (!customerStats[customerName]) {
        customerStats[customerName] = {
          frequency: 0,
          revenue: 0,
          totalQuantity: 0,
          averageOrderValue: 0
        };
      }

      customerStats[customerName].frequency += 1;
      customerStats[customerName].revenue += Number(sale.total_amount);
      customerStats[customerName].totalQuantity += sale.quantity;
    });

    // Traiter les paiements pour ajouter aux revenus
    payments?.forEach(payment => {
      const customerName = normalizeCustomerName(undefined, payment);
      if (!customerName) return;

      if (!customerStats[customerName]) {
        customerStats[customerName] = {
          frequency: 0,
          revenue: 0,
          totalQuantity: 0,
          averageOrderValue: 0
        };
      }

      // Ajouter les paiements au chiffre d'affaires (éviter le double comptage)
      // On considère que les paiements peuvent être des compléments aux ventes
      customerStats[customerName].revenue += Number(payment.paid_amount);
    });

    // Calculer la valeur moyenne des commandes
    Object.keys(customerStats).forEach(customerName => {
      const stats = customerStats[customerName];
      stats.averageOrderValue = stats.frequency > 0 ? stats.revenue / stats.frequency : 0;
    });

    // Convertir en tableau avec les noms
    const customersArray = Object.entries(customerStats).map(([name, stats]) => ({
      name,
      ...stats
    }));

    // Top clients par fréquence d'achat
    const topFrequent = [...customersArray]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 8);

    // Top clients par chiffre d'affaires
    const topRevenue = [...customersArray]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    return { topFrequent, topRevenue };
  }, [sales, payments]);

  const renderCustomerList = (customers: any[], title: string, valueKey: string, icon: any) => {
    const maxValue = customers.length > 0 ? Math.max(...customers.map(c => c[valueKey])) : 0;

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
          {customers.length === 0 ? (
            <div className="text-muted-foreground text-center py-8 text-sm">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
              Aucune donnée disponible
            </div>
          ) : (
            customers.map((customer, index) => (
              <div key={customer.name} className="group/item hover:bg-muted/30 p-2 rounded-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-secondary shadow-glow flex-shrink-0">
                    <span className="text-sm sm:text-base font-black text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-sm sm:text-base font-semibold text-foreground truncate">
                        {customer.name}
                      </p>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0 bg-primary/10 text-primary border-primary/20 font-bold">
                        {valueKey === 'frequency' && `${customer.frequency}`}
                        {valueKey === 'revenue' && formatCurrency(customer.revenue)}
                      </Badge>
                    </div>
                    <Progress 
                      value={maxValue > 0 ? (customer[valueKey] / maxValue) * 100 : 0} 
                      className="h-2 sm:h-2.5 mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" />
                        {customer.totalQuantity} articles
                      </span>
                      <span className="font-medium">Moy: {formatCurrency(customer.averageOrderValue)}</span>
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
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
      {renderCustomerList(
        topCustomersData.topFrequent,
        "Clients les Plus Fidèles",
        "frequency",
        <Users className="h-5 w-5 text-primary" />
      )}
      {renderCustomerList(
        topCustomersData.topRevenue,
        "Clients les Plus Rentables",
        "revenue",
        <Crown className="h-5 w-5 text-warning" />
      )}
    </div>
  );
}