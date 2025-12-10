import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ShoppingCart, Search, Plus, Eye, Grid3x3, List, Printer, Download, FileText } from "lucide-react";
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
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useAuth } from "@/contexts/AuthContext";
import stocknixLogo from "@/assets/stocknix-logo-official.png";

export default function Ventes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { sales, isLoading } = useSales();
  const { products } = useProducts();
  const { toast } = useToast();
  const { settings } = useCompanySettings();
  const { profile } = useAuth();
  const isMobile = useIsMobile();

  // Informations entreprise
  const companyName = settings?.company_name || profile?.company_name || "Stocknix";
  const companyAddress = settings?.company_address || "";
  const companyCity = settings?.company_city || "";
  const companyPhone = settings?.company_phone || "";
  const companyEmail = settings?.company_email || "";
  const companySiret = settings?.company_siret || "";
  const companyTva = settings?.company_tva || "";
  const logoUrl = settings?.logo_url || profile?.avatar_url || "";

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

  // Réimprimer le reçu (ticket POS)
  const reprintReceipt = (sale: any) => {
    const product = products.find(p => p.id === sale.product_id);
    const printWindow = window.open('', '', 'width=320,height=600');
    if (!printWindow) return;

    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket - ${companyName}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              width: 80mm; 
              padding: 8px;
              background: #fff;
            }
            .header { text-align: center; margin-bottom: 8px; }
            .company-name { font-size: 16px; font-weight: bold; text-transform: uppercase; }
            .company-info { font-size: 10px; color: #444; }
            .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
            .date-row { display: flex; justify-content: space-between; font-size: 10px; }
            .item { margin: 4px 0; }
            .item-name { font-weight: 500; }
            .item-detail { display: flex; justify-content: space-between; font-size: 11px; padding-left: 8px; }
            .total-section { margin-top: 8px; padding-top: 8px; border-top: 2px solid #000; }
            .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; }
            .footer { text-align: center; margin-top: 12px; font-size: 11px; }
            .thank-you { font-style: italic; font-weight: 500; }
            .powered { font-size: 9px; color: #666; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companyName}</div>
            ${companyAddress ? `<div class="company-info">${companyAddress}</div>` : ''}
            ${companyCity ? `<div class="company-info">${companyCity}</div>` : ''}
            ${companyPhone ? `<div class="company-info">Tél: ${companyPhone}</div>` : ''}
          </div>
          <div class="divider"></div>
          <div class="date-row">
            <span>Date: ${new Date(sale.sale_date).toLocaleDateString('fr-FR')}</span>
            <span>Heure: ${new Date(sale.sale_date).toLocaleTimeString('fr-FR')}</span>
          </div>
          <div class="divider"></div>
          <div class="item">
            <div class="item-name">${product?.name || 'Produit'}</div>
            <div class="item-detail">
              <span>${sale.quantity} x ${sale.unit_price.toLocaleString('fr-FR')} FCFA</span>
              <span>${sale.total_amount.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
          <div class="total-section">
            <div class="total-row">
              <span>TOTAL</span>
              <span>${sale.total_amount.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
          <div class="footer">
            <div class="thank-you">Merci et à bientôt !</div>
            <div class="powered">Powered by Stocknix</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Télécharger la FACTURE A4 en PDF
  const downloadReceiptPDF = async (sale: any) => {
    const product = products.find(p => p.id === sale.product_id);
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm'
    });

    const pageWidth = 210;
    const margin = 20;
    let y = 20;

    // Charger et ajouter le logo si disponible
    if (logoUrl) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = logoUrl;
        });
        doc.addImage(img, 'PNG', margin, y, 35, 35);
      } catch (e) {
        console.log("Logo non chargé, continuer sans");
      }
    }

    // En-tête entreprise
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 26, 59); // Bleu Nuit Stocknix
    doc.text(companyName.toUpperCase(), pageWidth - margin, y + 8, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    y += 15;
    if (companyAddress) {
      doc.text(companyAddress, pageWidth - margin, y, { align: 'right' });
      y += 5;
    }
    if (companyCity) {
      doc.text(companyCity, pageWidth - margin, y, { align: 'right' });
      y += 5;
    }
    if (companyPhone) {
      doc.text(`Tél: ${companyPhone}`, pageWidth - margin, y, { align: 'right' });
      y += 5;
    }
    if (companyEmail) {
      doc.text(companyEmail, pageWidth - margin, y, { align: 'right' });
      y += 5;
    }
    if (companySiret) {
      doc.text(`SIRET: ${companySiret}`, pageWidth - margin, y, { align: 'right' });
      y += 5;
    }
    if (companyTva) {
      doc.text(`N° TVA: ${companyTva}`, pageWidth - margin, y, { align: 'right' });
    }

    y = 70;

    // Titre FACTURE
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(46, 163, 242); // Bleu Clair Stocknix
    doc.text("FACTURE", margin, y);

    // Numéro et date
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    y += 12;
    doc.text(`N° ${sale.id.slice(0, 8).toUpperCase()}`, margin, y);
    doc.text(`Date: ${format(new Date(sale.sale_date), "dd MMMM yyyy", { locale: fr })}`, pageWidth - margin, y, { align: 'right' });

    // Ligne décorative
    y += 10;
    doc.setDrawColor(46, 163, 242);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);

    // Informations client
    y += 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 26, 59);
    doc.text("CLIENT", margin, y);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    y += 8;
    doc.text(sale.customer_name || "Client anonyme", margin, y);
    if (sale.customer_phone) {
      y += 6;
      doc.text(`Tél: ${sale.customer_phone}`, margin, y);
    }

    // Tableau des produits
    y += 20;
    
    // En-tête tableau
    doc.setFillColor(10, 26, 59);
    doc.rect(margin, y, pageWidth - 2 * margin, 12, 'F');
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("DESCRIPTION", margin + 5, y + 8);
    doc.text("QTÉ", 100, y + 8, { align: 'center' });
    doc.text("PRIX UNIT.", 135, y + 8, { align: 'center' });
    doc.text("TOTAL", pageWidth - margin - 5, y + 8, { align: 'right' });

    // Ligne produit
    y += 12;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, pageWidth - 2 * margin, 12, 'F');
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(product?.name || "Produit", margin + 5, y + 8);
    doc.text(sale.quantity.toString(), 100, y + 8, { align: 'center' });
    doc.text(`${sale.unit_price.toLocaleString('fr-FR')} FCFA`, 135, y + 8, { align: 'center' });
    doc.text(`${sale.total_amount.toLocaleString('fr-FR')} FCFA`, pageWidth - margin - 5, y + 8, { align: 'right' });

    // Total section
    y += 25;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(120, y, pageWidth - margin, y);
    
    y += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 26, 59);
    doc.text("TOTAL TTC", 120, y);
    doc.setTextColor(46, 163, 242);
    doc.text(`${sale.total_amount.toLocaleString('fr-FR')} FCFA`, pageWidth - margin, y, { align: 'right' });

    // Montant payé
    y += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("Montant payé:", 120, y);
    doc.text(`${sale.paid_amount.toLocaleString('fr-FR')} FCFA`, pageWidth - margin, y, { align: 'right' });

    // Pied de page
    y = 270;
    doc.setDrawColor(46, 163, 242);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Merci pour votre confiance !", pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.text("Facture générée par Stocknix - stocknix.space", pageWidth / 2, y, { align: 'center' });

    const fileName = `facture_${format(new Date(sale.sale_date), "yyyy-MM-dd")}_${sale.id.slice(0, 8)}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "✅ Facture téléchargée",
      description: "La facture PDF a été générée avec succès",
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
      {/* Header avec bouton à droite */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-muted-foreground">Enregistrez et suivez toutes vos ventes</p>
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