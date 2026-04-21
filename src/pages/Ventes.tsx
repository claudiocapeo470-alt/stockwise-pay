import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ShoppingCart, Search, Eye, Grid3x3, List, Printer, Download, TrendingUp, Trash2 } from "lucide-react";
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

export default function Ventes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const { sales, isLoading, deleteSale } = useSales();
  const { products } = useProducts();
  const { toast } = useToast();
  const { settings } = useCompanySettings();
  const { profile } = useAuth();
  const isMobile = useIsMobile();

  const companyName = settings?.company_name || profile?.company_name || "Stocknix";
  const companyAddress = settings?.company_address || "";
  const companyCity = settings?.company_city || "";
  const companyPhone = settings?.company_phone || "";
  const companyEmail = settings?.company_email || "";
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

  const generateDocumentA4 = async (
    sale: any,
    documentType: 'facture' | 'proforma' = 'facture',
    action: 'download' | 'print' = 'download'
  ) => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageWidth = 210;
    const margin = 20;
    let y = 20;

    const docTitle = documentType === 'facture' ? 'FACTURE' : 'PROFORMA';
    const docPrefix = documentType === 'facture' ? 'FAC' : 'PRO';

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
        console.log("Logo non chargé");
      }
    }

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(companyName.toUpperCase(), pageWidth - margin, y + 8, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    y += 15;
    if (companyAddress) { doc.text(companyAddress, pageWidth - margin, y, { align: 'right' }); y += 5; }
    if (companyCity) { doc.text(companyCity, pageWidth - margin, y, { align: 'right' }); y += 5; }
    if (companyPhone) { doc.text(`Tél: ${companyPhone}`, pageWidth - margin, y, { align: 'right' }); y += 5; }
    if (companyEmail) { doc.text(companyEmail, pageWidth - margin, y, { align: 'right' }); y += 5; }

    y = 70;
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text(docTitle, margin, y);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    y += 12;
    doc.text(`N° ${docPrefix}-${sale.id.slice(0, 8).toUpperCase()}`, margin, y);
    doc.text(`Date: ${format(new Date(sale.sale_date), "dd MMMM yyyy", { locale: fr })}`, pageWidth - margin, y, { align: 'right' });

    y += 10;
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    y += 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text("CLIENT", margin, y);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    y += 8;
    doc.text(sale.customer_name || "Client anonyme", margin, y);
    if (sale.customer_phone) { y += 6; doc.text(`Tél: ${sale.customer_phone}`, margin, y); }

    y += 20;
    doc.setFillColor(17, 24, 39);
    doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("DESCRIPTION", margin + 5, y + 7);
    doc.text("QTÉ", 100, y + 7, { align: 'center' });
    doc.text("PRIX UNIT.", 135, y + 7, { align: 'center' });
    doc.text("TOTAL", pageWidth - margin - 5, y + 7, { align: 'right' });

    // Build line items (multi-product support)
    const lineItems: Array<{ name: string; qty: number; unitPrice: number; total: number }> = [];

    if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
      sale.items.forEach((item: any) => {
        lineItems.push({
          name: item.name || item.product_name || 'Article',
          qty: item.quantity || 1,
          unitPrice: item.unit_price || item.price || 0,
          total: item.total_amount || (item.quantity * item.price) || 0,
        });
      });
    } else {
      const productName = sale.products?.name
        || products.find(p => p.id === sale.product_id)?.name
        || 'Produit';
      lineItems.push({
        name: productName,
        qty: sale.quantity,
        unitPrice: sale.unit_price,
        total: sale.total_amount,
      });
    }

    lineItems.forEach((item, index) => {
      y += 10;
      const bgColor = index % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');

      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);
      let displayName = item.name;
      const maxNameWidth = 65;
      if (doc.getTextWidth(displayName) > maxNameWidth) {
        while (doc.getTextWidth(displayName + '...') > maxNameWidth && displayName.length > 0) {
          displayName = displayName.slice(0, -1);
        }
        displayName += '...';
      }
      doc.text(displayName, margin + 5, y + 7);
      doc.text(item.qty.toString(), 100, y + 7, { align: 'center' });
      doc.text(`${item.unitPrice.toLocaleString('fr-FR')} FCFA`, 135, y + 7, { align: 'center' });
      doc.text(`${item.total.toLocaleString('fr-FR')} FCFA`, pageWidth - margin - 5, y + 7, { align: 'right' });
    });

    y += 20;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(120, y, pageWidth - margin, y);

    y += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text("TOTAL TTC", 120, y);
    doc.setTextColor(0, 102, 204);
    doc.text(`${sale.total_amount.toLocaleString('fr-FR')} FCFA`, pageWidth - margin, y, { align: 'right' });

    y = 270;
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("Merci pour votre confiance !", pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.text(`${docTitle} générée par Stocknix`, pageWidth / 2, y, { align: 'center' });

    if (action === 'download') {
      doc.save(`${documentType}_${format(new Date(sale.sale_date), "yyyy-MM-dd")}_${sale.id.slice(0, 8)}.pdf`);
      toast({ title: `✅ ${docTitle} téléchargée` });
    } else {
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      if (printWindow) { printWindow.onload = () => printWindow.print(); }
      toast({ title: `🖨️ Impression ${docTitle}` });
    }
  };

  const handleDelete = async (saleId: string) => {
    try {
      await deleteSale.mutateAsync(saleId);
    } catch (e) {
      // Error handled by hook toast
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header large inspiré */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Suivi des ventes
          </h1>
          <p className="text-sm text-muted-foreground">
            {sales.length} {sales.length > 1 ? "transactions enregistrées" : "transaction enregistrée"} • {totalSales.toLocaleString()} FCFA de chiffre d'affaires
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddSaleDialog />
        </div>
      </div>

      {/* Stats compactes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold truncate">{sales.length}</p>
              <p className="text-xs text-muted-foreground">Ventes totales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-success/10 flex items-center justify-center rounded-xl">
              <ShoppingCart className="h-5 w-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold truncate">{todaySales.length}</p>
              <p className="text-xs text-muted-foreground">Aujourd'hui • {todayTotal.toLocaleString()} FCFA</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-secondary/10 flex items-center justify-center rounded-xl">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold truncate">{totalSales.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Chiffre d'affaires (FCFA)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar — barre filtres style pills */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between border-b border-border/60 pb-4">
        <div className="relative flex-1 lg:max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par client ou produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-muted/40 border-border/60"
          />
        </div>
        {!isMobile && (
          <div className="inline-flex rounded-xl border border-border bg-card p-0.5">
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-9 w-9 p-0 rounded-lg">
              <List className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-9 w-9 p-0 rounded-lg">
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Sales list */}
      {filteredSales.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {sales.length === 0 ? "Aucune vente" : "Aucun résultat"}
            </h3>
            <p className="text-muted-foreground">
              {sales.length === 0
                ? "Commencez par enregistrer votre première vente"
                : "Aucune vente trouvée pour cette recherche"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Table view */}
          {!isMobile && viewMode === "list" && (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(sale.sale_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sale.products?.name || "Produit supprimé"}
                      </TableCell>
                      <TableCell>
                        {sale.customer_name || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-center">{sale.quantity}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {sale.total_amount.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedSale(sale); setShowSaleDetails(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => generateDocumentA4(sale, 'facture', 'download')}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => generateDocumentA4(sale, 'facture', 'print')}>
                            <Printer className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer cette vente ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. La vente de{" "}
                                  {sale.total_amount.toLocaleString()} FCFA{" "}
                                  sera définitivement supprimée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(sale.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Grid view */}
          {(isMobile || viewMode === "grid") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSales.map((sale) => (
                <Card key={sale.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{sale.products?.name || "Produit"}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(sale.sale_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </p>
                      </div>
                      <p className="font-bold">{sale.total_amount.toLocaleString()} FCFA</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Client</span>
                      <span>{sale.customer_name || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantité</span>
                      <span>{sale.quantity}</span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedSale(sale); setShowSaleDetails(true); }}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> Détails
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => generateDocumentA4(sale, 'facture', 'download')}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette vente ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. La vente sera définitivement supprimée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(sale.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {selectedSale && (
        <SaleDetailsDialog
          sale={selectedSale}
          open={showSaleDetails}
          onOpenChange={(open) => {
            setShowSaleDetails(open);
            if (!open) setSelectedSale(null);
          }}
        />
      )}
    </div>
  );
}
