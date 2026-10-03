import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Edit, Trash2, Copy, Download, MoreHorizontal, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ListAvatar, ListBadge, ListRow, ListShell } from "@/components/layout/MinimalList";

import type { Invoice } from "@/hooks/useInvoices";

/** Couleur d'accent par statut (tokens sémantiques uniquement). */
const STATUS_TONE: Record<string, { dot: string; text: string; soft: string }> = {
  brouillon: { dot: "bg-muted-foreground/50", text: "text-muted-foreground", soft: "bg-muted" },
  envoye: { dot: "bg-primary", text: "text-primary", soft: "bg-primary/10" },
  paye: { dot: "bg-success", text: "text-success", soft: "bg-success/10" },
  accepte: { dot: "bg-success", text: "text-success", soft: "bg-success/10" },
  refuse: { dot: "bg-destructive", text: "text-destructive", soft: "bg-destructive/10" },
  annule: { dot: "bg-destructive", text: "text-destructive", soft: "bg-destructive/10" },
};

export interface DocumentListViewProps {
  documents: Invoice[];
  statusLabels: Record<string, string>;
  formatAmount: (amount: number) => string;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Liste minimaliste continue de documents (factures / devis).
 * Séparateurs fins et actions discrètes, sans regroupement par période.
 */
export function DocumentListView({
  documents,
  statusLabels,
  formatAmount,
  onOpen,
  onEdit,
  onDuplicate,
  onDownload,
  onDelete,
}: DocumentListViewProps) {
  return (
    <ListShell>
      {documents.map((doc) => {
              const tone = STATUS_TONE[doc.status] ?? STATUS_TONE.brouillon;
              const initials = (doc.client_name || "?")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase())
                .join("");
              return (
                <ListRow
                  key={doc.id}
                  onClick={() => onOpen(doc.id!)}
                  onSwipeDelete={() => onDelete(doc.id!)}
                  leading={
                    <ListAvatar
                      icon={initials || <FileText className="h-4 w-4" />}
                      className={cn("text-[11px] font-bold", tone.soft, tone.text)}
                    />
                  }
                  title={doc.client_name}
                  badge={<ListBadge className={cn(tone.soft, tone.text)}>{statusLabels[doc.status] ?? doc.status}</ListBadge>}
                  subtitle={doc.document_number}
                  meta={format(new Date(doc.issue_date), "dd MMM yyyy", { locale: fr })}
                  value={formatAmount(doc.total_amount)}
                  actions={
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Actions du document"
                            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => onOpen(doc.id!)}>
                            <Eye className="mr-2 h-4 w-4" />Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(doc.id!)}>
                            <Edit className="mr-2 h-4 w-4" />Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(doc.id!)}>
                            <Copy className="mr-2 h-4 w-4" />Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDownload(doc.id!)}>
                            <Download className="mr-2 h-4 w-4" />Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(doc.id!)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  }
                />
              );
      })}
    </ListShell>
  );
}
