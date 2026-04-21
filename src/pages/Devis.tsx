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
    <div className="space-y-8 animate-fade-in">
      {/* Header large */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Devis</h1>
          <p className="text-sm text-muted-foreground">
            {invoices.length} devis émis · {acceptedCount} accepté{acceptedCount > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => navigate('/app/devis/new')} className="h-10 px-5 rounded-lg shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Devis
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{invoices.length}</p>
              <p className="text-sm text-muted-foreground">Total Devis</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-success/10 flex items-center justify-center rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{acceptedCount}</p>
              <p className="text-sm text-muted-foreground">Acceptés</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-warning/10 flex items-center justify-center rounded-xl">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar pills + search */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
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
        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher devis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-muted/40 border-border/60"
            />
          </div>
          {!isMobile && (
            <div className="inline-flex rounded-lg border border-border/60 bg-card p-0.5">
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-8 w-8 p-0"><List className="h-4 w-4" /></Button>
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-8 w-8 p-0"><Grid3x3 className="h-4 w-4" /></Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {filteredInvoices.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{invoices.length === 0 ? "Aucun devis" : "Aucun résultat"}</h3>
            <p className="text-muted-foreground mb-4">{invoices.length === 0 ? "Commencez par créer votre premier devis" : "Aucun devis trouvé pour cette recherche"}</p>
            {invoices.length === 0 && (
              <Button onClick={() => navigate('/app/devis/new')}>
                <Plus className="mr-2 h-4 w-4" />Créer un devis
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Table view */}
          {!isMobile && viewMode === "list" && (
            <Card className="border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Numéro</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Client</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Date</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase text-right">Montant</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase text-center">Statut</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-border/40 hover:bg-muted/20">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <p className="font-semibold text-foreground">{invoice.document_number}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{invoice.client_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{format(new Date(invoice.issue_date), 'dd MMM yyyy', { locale: fr })}</TableCell>
                      <TableCell className="text-right font-bold text-foreground">{invoice.total_amount.toLocaleString()} FCFA</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${statusColors[invoice.status]} font-medium`}>{statusLabels[invoice.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-0.5 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/app/devis/${invoice.id}/preview`)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/app/devis/${invoice.id}`)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDuplicate(invoice.id!)}><Copy className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setInvoiceToDelete(invoice.id!); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="border-border/60 hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate">{invoice.document_number}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{invoice.client_name}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[invoice.status]}>{statusLabels[invoice.status]}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm font-medium">{format(new Date(invoice.issue_date), 'dd/MM/yyyy', { locale: fr })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Montant</p>
                        <p className="text-lg font-bold">{invoice.total_amount.toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border/60">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/app/devis/${invoice.id}/preview`)} className="flex-1"><Eye className="h-3.5 w-3.5 mr-1.5" />Voir</Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm"><MoreVertical className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/app/devis/${invoice.id}`)}><Edit className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(invoice.id!)}><Copy className="mr-2 h-4 w-4" />Dupliquer</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/app/devis/${invoice.id}/preview`)}><Download className="mr-2 h-4 w-4" />Télécharger</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setInvoiceToDelete(invoice.id!); setDeleteDialogOpen(true); }} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
