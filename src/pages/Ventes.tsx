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
    const docTitle = documentType === 'facture' ? 'Facture' : 'Proforma';
    const docPrefix = documentType === 'facture' ? 'FAC' : 'PRO';

    // Construction des lignes (support multi-produits)
    const rawItems: Array<{ name: string; qty: number; unitPrice: number; total: number }> = [];
    if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
      sale.items.forEach((item: any) => {
        rawItems.push({
          name: item.name || item.product_name || 'Article',
          qty: item.quantity || 1,
          unitPrice: item.unit_price || item.price || 0,
          total: item.total_amount || (item.quantity * (item.unit_price || item.price || 0)) || 0,
        });
      });
    } else {
      rawItems.push({
        name: sale.products?.name || products.find(p => p.id === sale.product_id)?.name || 'Produit',
        qty: sale.quantity,
        unitPrice: sale.unit_price,
        total: sale.total_amount,
      });
    }

    const items = rawItems.map((it, i) => ({
      description: it.name,
      quantity: it.qty,
      unit_price: it.unitPrice,
      tax_rate: 0,
      discount_rate: 0,
      subtotal: it.total,
      tax_amount: 0,
      total_amount: it.total,
      position: i,
    }));

    const invoiceLike: any = {
      document_type: documentType === 'facture' ? 'facture' : 'devis',
      document_number: `${docPrefix}-${sale.id.slice(0, 8).toUpperCase()}`,
      status: 'paye',
      issue_date: sale.sale_date,
      company_name: companyName,
      company_address: companyAddress,
      company_city: companyCity,
      company_phone: companyPhone,
      company_email: companyEmail,
      company_logo_url: logoUrl,
      client_name: sale.customer_name || 'Client anonyme',
      client_phone: sale.customer_phone || '',
      subtotal: sale.total_amount,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: sale.total_amount,
      notes: '',
      terms: '',
    };

    await exportInvoiceToPDF(invoiceLike, items, 'FCFA', action);
    toast({ title: action === 'download' ? `${docTitle} téléchargée` : `Impression ${docTitle}` });
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
      {/* Barre de recherche + ajout */}
      <PageActionBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par client ou produit..."
        primary={<AddSaleDialog />}
      />

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
