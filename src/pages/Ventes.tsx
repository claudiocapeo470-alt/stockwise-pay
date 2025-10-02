import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Search, Plus, Eye } from "lucide-react";
import { useState } from "react";
import { useSales } from "@/hooks/useSales";
import { AddSaleDialog } from "@/components/sales/AddSaleDialog";
import { SaleDetailsDialog } from "@/components/sales/SaleDetailsDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Ventes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const { sales, isLoading } = useSales();

  const filteredSales = sales.filter(sale =>
    (sale.customer_name && sale.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (sale.products?.name && sale.products.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const todaySales = sales.filter(sale => {
    const today = new Date();
    const saleDate = new Date(sale.sale_date);
    return saleDate.toDateString() === today.toDateString();
  });
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Ventes</h1>
          <p className="text-muted-foreground">Enregistrez et suivez toutes vos ventes</p>
        </div>
        <AddSaleDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes Totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
            <p className="text-xs text-muted-foreground">
              Transactions enregistrées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes Aujourd'hui</CardTitle>
            <ShoppingCart className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{todaySales.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayTotal.toLocaleString()} FCFA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalSales.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              Total des ventes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par client ou produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">Historique des ventes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {sales.length === 0 
                  ? "Aucune vente enregistrée. Commencez par enregistrer votre première vente."
                  : "Aucune vente trouvée pour cette recherche."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix Unitaire</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {format(new Date(sale.sale_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {sale.products?.name || "Produit supprimé"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sale.customer_name || "Client anonyme"}</p>
                        {sale.customer_phone && (
                          <p className="text-sm text-muted-foreground">{sale.customer_phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{sale.unit_price.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <span className="font-semibold">{sale.total_amount.toLocaleString()} FCFA</span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          setSelectedSale(sale);
                          setShowSaleDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SaleDetailsDialog
        sale={selectedSale}
        open={showSaleDetails}
        onOpenChange={setShowSaleDetails}
      />
    </div>
  );
}