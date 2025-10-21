import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ShoppingCart, Search, Plus, Eye, Grid3x3, List, Printer, Download } from "lucide-react";
import { useState } from "react";
import { useSales } from "@/hooks/useSales";
import { useProducts } from "@/hooks/useProducts";
import { AddSaleDialog } from "@/components/sales/AddSaleDialog";
import { SaleDetailsDialog } from "@/components/sales/SaleDetailsDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

export default function Ventes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { sales, isLoading } = useSales();
  const { products } = useProducts();
  const { toast } = useToast();
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

  // Réimprimer le reçu
  const reprintReceipt = (sale: any) => {
    const product = products.find(p => p.id === sale.product_id);
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;

    const receiptContent = `
      <html>
        <head>
          <title>Reçu - SIGR SUPERMARCHÉ</title>
          <style>
            body { font-family: monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 10px; }
            h3 { text-align: center; margin: 10px 0; }
            .line { border-bottom: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin: 3px 0; }
            .total { font-weight: bold; font-size: 14px; text-align: right; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h3>🧾 SIGR SUPERMARCHÉ</h3>
          <div class="line"></div>
          <p>Date: ${new Date(sale.sale_date).toLocaleString('fr-FR')}</p>
          <div class="line"></div>
          <div class="item">
            <span>${product?.name || 'Produit'} x${sale.quantity}</span>
            <span>${sale.total_amount.toLocaleString()} FCFA</span>
          </div>
          <div class="line"></div>
          <div class="total">TOTAL: ${sale.total_amount.toLocaleString()} FCFA</div>
          <div class="footer">
            <p>Merci pour votre achat 🙏</p>
            <p>À bientôt !</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Télécharger le reçu en PDF
  const downloadReceiptPDF = (sale: any) => {
    const product = products.find(p => p.id === sale.product_id);
    const doc = new jsPDF({
      format: [80, 150],
      unit: 'mm'
    });

    doc.setFontSize(14);
    doc.text('SIGR SUPERMARCHÉ', 40, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text('─────────────────────────────', 40, 15, { align: 'center' });
    doc.text(`Date: ${new Date(sale.sale_date).toLocaleString('fr-FR')}`, 5, 20);
    doc.text('─────────────────────────────', 40, 25, { align: 'center' });

    doc.setFontSize(9);
    doc.text(`${product?.name || 'Produit'} x${sale.quantity}`, 5, 35);
    doc.text(`${sale.total_amount.toLocaleString()} FCFA`, 70, 35, { align: 'right' });

    doc.text('─────────────────────────────', 40, 40, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`TOTAL: ${sale.total_amount.toLocaleString()} FCFA`, 70, 50, { align: 'right' });
    
    doc.setFontSize(8);
    doc.text('Merci pour votre achat 🙏', 40, 60, { align: 'center' });

    const fileName = `recu_${new Date(sale.sale_date).toISOString().slice(0, 10)}_${sale.id.slice(0, 8)}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "✅ PDF téléchargé",
      description: "Le reçu a été téléchargé avec succès",
    });
  };

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
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowSaleDetails(true);
                              }}
                              title="Voir détails"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => reprintReceipt(sale)}
                              title="Réimprimer"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => downloadReceiptPDF(sale)}
                              title="PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setShowSaleDetails(true);
                                }}
                                title="Voir détails"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => reprintReceipt(sale)}
                                title="Réimprimer le reçu"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => downloadReceiptPDF(sale)}
                                title="Télécharger PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
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