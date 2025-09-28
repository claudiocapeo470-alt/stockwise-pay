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
      <Card className="bg-gradient-surface border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-foreground">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune donnée disponible
            </p>
          ) : (
            customers.map((customer, index) => (
              <div key={customer.name} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">
                      {customer.name}
                    </p>
                    <Badge variant="secondary" className="ml-2">
                      {valueKey === 'frequency' && `${customer.frequency} achats`}
                      {valueKey === 'revenue' && formatCurrency(customer.revenue)}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={maxValue > 0 ? (customer[valueKey] / maxValue) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>
                      {customer.totalQuantity} articles
                    </span>
                    <span>
                      Moy: {formatCurrency(customer.averageOrderValue)}
                    </span>
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
    <div className="grid gap-6 md:grid-cols-2">
      {renderCustomerList(
        topCustomersData.topFrequent,
        "Clients les Plus Fidèles",
        "frequency",
        <Users className="mr-2 h-5 w-5 text-primary" />
      )}
      {renderCustomerList(
        topCustomersData.topRevenue,
        "Clients les Plus Rentables",
        "revenue",
        <Crown className="mr-2 h-5 w-5 text-warning" />
      )}
    </div>
  );
}