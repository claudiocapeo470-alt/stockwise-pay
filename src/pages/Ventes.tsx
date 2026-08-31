import { PageActionBar } from "@/components/layout/PageActionBar";
import { SectionHeading, StickyTop } from "@/components/layout/PageShell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListShell, ListRow, ListAvatar, ListEmpty } from "@/components/layout/MinimalList";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ShoppingCart, Search, Eye, Printer, Download, TrendingUp, Trash2 } from "lucide-react";
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
import { useCurrency } from "@/hooks/useCurrency";

export default function Ventes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  

  const { sales, isLoading, deleteSale } = useSales();
  const { products } = useProducts();
  const { toast } = useToast();
  const { settings } = useCompanySettings();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const { formatCurrency } = useCurrency();

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
      doc.text(`${item.unitPrice.toLocaleString('de-DE')} FCFA`, 135, y + 7, { align: 'center' });
      doc.text(`${item.total.toLocaleString('de-DE')} FCFA`, pageWidth - margin - 5, y + 7, { align: 'right' });
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
    doc.text(`${sale.total_amount.toLocaleString('de-DE')} FCFA`, pageWidth - margin, y, { align: 'right' });

    y = 270;
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("Merci pour votre confiance !", pageWidth / 2, y, { align: 'center' });

    if (action === 'download') {
      doc.save(`${documentType}_${format(new Date(sale.sale_date), "yyyy-MM-dd")}_${sale.id.slice(0, 8)}.pdf`);
      toast({ title: `✅ ${docTitle} téléchargée` });
    } else {
      // Print via hidden iframe — keeps the URL clean (no blob:lovableproject.com exposed)
      const dataUri = doc.output('datauristring');
      let iframe = document.getElementById('stx-print-frame') as HTMLIFrameElement | null;
      if (iframe) iframe.remove();
      iframe = document.createElement('iframe');
      iframe.id = 'stx-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = dataUri;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        try {
          iframe!.contentWindow?.focus();
          iframe!.contentWindow?.print();
        } catch (e) {
          // Fallback: open the PDF in a new tab
          const win = window.open(dataUri, '_blank');
          if (win) win.focus();
        }
      };
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
    <div className="space-y-5 animate-fade-in">



      <StickyTop>
      {/* Stats compactes */}
      <div className="stat-scroller" style={{ ["--stat-cols" as any]: 3 }}>
        <Card>
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-primary/10 flex items-center justify-center rounded-xl shrink-0">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold leading-none truncate">{sales.length}</p>
              <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">Ventes totales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-success/10 flex items-center justify-center rounded-xl shrink-0">
              <ShoppingCart className="h-5 w-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold leading-none truncate">{todaySales.length}</p>
              <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">Aujourd'hui • {todayTotal.toLocaleString('de-DE')} FCFA</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-secondary/10 flex items-center justify-center rounded-xl shrink-0">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold leading-none truncate">{totalSales.toLocaleString('de-DE')}</p>
              <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">Chiffre d'affaires (FCFA)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <PageActionBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par client ou produit..."
        primary={<AddSaleDialog />}
      />
      </StickyTop>

      {/* Sales grid */}
      {filteredSales.length === 0 ? (
        <ListEmpty
          icon={<ShoppingCart className="h-5 w-5" />}
          title={sales.length === 0 ? "Aucune vente" : "Aucun résultat"}
          description={
            sales.length === 0
              ? "Commencez par enregistrer votre première vente"
              : "Aucune vente trouvée pour cette recherche"
          }
        />
      ) : (
        <>
          <SectionHeading title="Transactions" count={filteredSales.length} />
          <ListShell>
            {filteredSales.map((sale) => (
              <ListRow
                key={sale.id}
                onClick={() => { setSelectedSale(sale); setShowSaleDetails(true); }}
                leading={
                  <ListAvatar
                    src={(sale.products as any)?.image_url}
                    alt={sale.products?.name || "Produit"}
                    icon={<ShoppingCart className="h-5 w-5" />}
                  />
                }
                title={sale.products?.name || "Produit"}
                subtitle={sale.customer_name || "Client anonyme"}
                meta={format(new Date(sale.sale_date), "dd MMM yyyy · HH:mm", { locale: fr })}
                hint={`Qté ${sale.quantity}`}
                value={formatCurrency(sale.total_amount)}
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedSale(sale); setShowSaleDetails(true); }}><Eye className="mr-2 h-4 w-4" />Détails</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generateDocumentA4(sale, 'facture', 'download')}><Download className="mr-2 h-4 w-4" />Télécharger</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generateDocumentA4(sale, 'facture', 'print')}><Printer className="mr-2 h-4 w-4" />Imprimer</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(sale.id)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              />
            ))}
          </ListShell>
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
          onDownload={() => generateDocumentA4(selectedSale, 'facture', 'download')}
          onPrint={() => generateDocumentA4(selectedSale, 'facture', 'print')}
          onDelete={() => handleDelete(selectedSale.id)}
        />
      )}
    </div>
  );
}
