import { PageActionBar } from "@/components/layout/PageActionBar";
import { SectionHeading, StickyTop } from "@/components/layout/PageShell";
import { FilterPills } from "@/components/layout/FilterPills";
import { ListEmpty } from "@/components/layout/MinimalList";
import { DocumentListView } from "@/components/invoices/DocumentListView";
import { useState } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/hooks/useCurrency";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Factures() {
  const navigate = useNavigate();
  const { invoices, isLoading, deleteInvoice, duplicateInvoice } = useInvoices('facture');
  const { formatCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvoices = invoices.filter((invoice) => {
    const matchSearch =
      invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.document_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async () => {
    if (invoiceToDelete) {
      await deleteInvoice(invoiceToDelete);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const statusLabels: Record<string, string> = {
    brouillon: "Brouillon",
    envoye: "Envoyé",
    paye: "Payé",
    annule: "Annulé",
  };

  const paidCount = invoices.filter(i => i.status === 'paye').length;
  const pendingCount = invoices.filter(i => i.status === 'envoye' || i.status === 'brouillon').length;

  const filters = [
    { key: "all", label: "Tous" },
    { key: "brouillon", label: "Brouillons" },
    { key: "envoye", label: "Envoyés" },
    { key: "paye", label: "Payés" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <StickyTop>
        <PageActionBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Rechercher facture..."
          primary={
            <Button onClick={() => navigate('/app/factures/new')} className="h-11 px-5 rounded-xl gap-2">
              <Plus className="h-4 w-4" /><span>Nouvelle Facture</span>
            </Button>
          }
        />

        {/* Stats */}
        <div className="stat-scroller" style={{ ["--stat-cols" as any]: 3 }}>
          <Card className="border-border/60">
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 bg-primary/10 flex items-center justify-center rounded-xl shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold leading-none truncate">{invoices.length}</p>
                <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">Total Factures</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 bg-success/10 flex items-center justify-center rounded-xl shrink-0">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold leading-none truncate">{paidCount}</p>
                <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">Payées</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 bg-warning/10 flex items-center justify-center rounded-xl shrink-0">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold leading-none truncate">{pendingCount}</p>
                <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">En attente</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres centrés */}
        <FilterPills filters={filters} value={statusFilter} onChange={setStatusFilter} />
      </StickyTop>

      {/* Content */}
      {filteredInvoices.length === 0 ? (
        <ListEmpty
          icon={<FileText className="h-6 w-6" />}
          title={invoices.length === 0 ? "Aucune facture" : "Aucun résultat"}
          description={invoices.length === 0 ? "Commencez par créer votre première facture" : "Aucune facture trouvée pour cette recherche"}
        />
      ) : (
        <>
          <SectionHeading title="Factures" count={filteredInvoices.length} />
          <DocumentListView
            documents={filteredInvoices}
            statusLabels={statusLabels}
            formatAmount={formatCurrency}
            onOpen={(id) => navigate(`/app/factures/${id}/preview`)}
            onEdit={(id) => navigate(`/app/factures/${id}`)}
            onDuplicate={(id) => duplicateInvoice(id)}
            onDownload={(id) => navigate(`/app/factures/${id}/preview`)}
            onDelete={(id) => { setInvoiceToDelete(id); setDeleteDialogOpen(true); }}
          />
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
