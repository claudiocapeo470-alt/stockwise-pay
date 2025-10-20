import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ShoppingCart, Search, Plus, Eye, Grid3x3, List } from "lucide-react";
import { useState } from "react";
import { useSales } from "@/hooks/useSales";
import { AddSaleDialog } from "@/components/sales/AddSaleDialog";
import { SaleDetailsDialog } from "@/components/sales/SaleDetailsDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Ventes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { sales, isLoading } = useSales();
  const isMobile = useIsMobile();

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
      {/* Header Block with Description and Button */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800/40 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">Gestion des Ventes</h2>
          <p className="text-blue-700 dark:text-blue-300">Enregistrez et suivez toutes vos ventes</p>
        </div>
        <AddSaleDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Ventes Totales</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500 shadow-md">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{sales.length}</div>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Transactions enregistrées
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Ventes Aujourd'hui</CardTitle>
            <div className="p-2 rounded-lg bg-green-500 shadow-md">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{todaySales.length}</div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {todayTotal.toLocaleString()} FCFA
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Chiffre d'Affaires</CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500 shadow-md">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalSales.toLocaleString()} FCFA</div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
              Total des ventes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par client ou produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {!isMobile && (
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sales Display */}
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
            <>
              {/* Grid View for Mobile or when selected */}
              {(isMobile || viewMode === "grid") && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSales.map((sale) => (
                    <Card key={sale.id} className="hover:shadow-lg transition-shadow bg-background/50">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base font-semibold text-foreground">
                              {sale.products?.name || "Produit supprimé"}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(sale.sale_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowSaleDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Client</span>
                          <div className="text-right">
                            <p className="text-sm font-medium">{sale.customer_name || "Client anonyme"}</p>
                            {sale.customer_phone && (
                              <p className="text-xs text-muted-foreground">{sale.customer_phone}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Quantité</span>
                          <Badge variant="secondary">{sale.quantity}</Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Prix Unitaire</span>
                          <span className="text-sm font-medium">{sale.unit_price.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm font-medium">Total</span>
                          <span className="text-lg font-bold text-primary">{sale.total_amount.toLocaleString()} FCFA</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Table View for Desktop */}
              {!isMobile && viewMode === "list" && (
                <div className="overflow-x-auto">
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
                </div>
              )}
            </>
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