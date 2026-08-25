import { PageActionBar } from "@/components/layout/PageActionBar";
import { SectionHeading } from "@/components/layout/PageShell";
import { FilterPills } from "@/components/layout/FilterPills";
import { ListShell, ListRow, ListAvatar, ListBadge, ListEmpty } from "@/components/layout/MinimalList";
import { useState } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Eye, Edit, Trash2, Copy, Download, Search, MoreVertical, Grid3x3, List, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export default function Devis() {
  const navigate = useNavigate();
  const { invoices, isLoading, deleteInvoice, duplicateInvoice } = useInvoices('devis');
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const isMobile = useIsMobile();

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

  const handleDuplicate = async (id: string) => {
    await duplicateInvoice(id);
  };

  const statusColors: Record<string, string> = {
    brouillon: "bg-muted text-muted-foreground",
    envoye: "bg-primary/10 text-primary",
    accepte: "bg-success/10 text-success",
    refuse: "bg-destructive/10 text-destructive",
    annule: "bg-destructive/10 text-destructive",
  };

  const statusLabels: Record<string, string> = {
    brouillon: "Brouillon",
    envoye: "Envoyé",
    accepte: "Accepté",
    refuse: "Refusé",
    annule: "Annulé",
  };

  const acceptedCount = invoices.filter(i => i.status === 'accepte').length;
  const pendingCount = invoices.filter(i => i.status === 'envoye' || i.status === 'brouillon').length;

  const filters = [
    { key: "all", label: "Tous" },
    { key: "brouillon", label: "Brouillons" },
    { key: "envoye", label: "Envoyés" },
    { key: "accepte", label: "Acceptés" },
    { key: "refuse", label: "Refusés" },
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
      {/* Stats */}
      <div className="stat-scroller" style={{ ["--stat-cols" as any]: 3 }}>
        <Card className="border-border/60">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-primary/10 flex items-center justify-center rounded-xl shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold leading-none truncate">{invoices.length}</p>
              <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">Total Devis</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-success/10 flex items-center justify-center rounded-xl shrink-0">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold leading-none truncate">{acceptedCount}</p>
              <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">Acceptés</p>
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

      {/* Toolbar pills + search */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                statusFilter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <PageActionBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher devis..."
        primary={<Button onClick={() => navigate('/app/devis/new')} className="h-11 px-5 rounded-xl gap-2"><Plus className="h-4 w-4" /><span>Nouveau Devis</span></Button>}
      />


      {/* Content */}
      {filteredInvoices.length === 0 ? (
        <ListEmpty
          icon={<FileText className="h-6 w-6" />}
          title={invoices.length === 0 ? "Aucun devis" : "Aucun résultat"}
          description={invoices.length === 0 ? "Commencez par créer votre premier devis" : "Aucun devis trouvé pour cette recherche"}
        />
      ) : (
        <>
          <SectionHeading
            title="Devis"
            count={filteredInvoices.length}
          />
          {/* Liste minimaliste unifiée */}
          <ListShell>
            {filteredInvoices.map((invoice) => (
              <ListRow
                key={invoice.id}
                onClick={() => navigate(`/app/devis/${invoice.id}/preview`)}
                leading={<ListAvatar icon={<FileText className="h-5 w-5" />} tone="primary" />}
                title={invoice.document_number}
                badge={<ListBadge className={statusColors[invoice.status]}>{statusLabels[invoice.status]}</ListBadge>}
                subtitle={`${invoice.client_name} · ${format(new Date(invoice.issue_date), 'dd MMM yyyy', { locale: fr })}`}
                value={<>{invoice.total_amount.toLocaleString('de-DE')}<span className="text-[11px] font-normal text-muted-foreground ml-1">FCFA</span></>}
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/app/devis/${invoice.id}/preview`)}><Eye className="mr-2 h-4 w-4" />Voir</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/app/devis/${invoice.id}`)}><Edit className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(invoice.id!)}><Copy className="mr-2 h-4 w-4" />Dupliquer</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/app/devis/${invoice.id}/preview`)}><Download className="mr-2 h-4 w-4" />Télécharger</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setInvoiceToDelete(invoice.id!); setDeleteDialogOpen(true); }} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              />
            ))}
          </ListShell>

        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.</AlertDialogDescription>
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
