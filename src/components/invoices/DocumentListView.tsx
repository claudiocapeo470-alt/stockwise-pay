import { Fragment } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Edit, Trash2, Copy, Download, MoreHorizontal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
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

function groupLabel(date: Date) {
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return "Hier";
  const label = format(date, "MMMM yyyy", { locale: fr });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

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
 * Liste minimaliste de documents (factures / devis).
 * Regroupée par période, séparateurs fins, actions discrètes au survol.
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
  const groups: { label: string; items: Invoice[] }[] = [];
  documents.forEach((doc) => {
    const label = groupLabel(new Date(doc.issue_date));
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(doc);
    else groups.push({ label, items: [doc] });
  });

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.label}>
          <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {group.label}
          </p>

          <ul className="divide-y divide-border/50 rounded-2xl border border-border/50 bg-card overflow-hidden shadow-[0_1px_2px_hsl(var(--foreground)/0.04)]">
            {group.items.map((doc) => {
              const tone = STATUS_TONE[doc.status] ?? STATUS_TONE.brouillon;
              const initials = (doc.client_name || "?")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase())
                .join("");
              return (
                <li key={doc.id}>
                 <SwipeToDelete onDelete={() => onDelete(doc.id!)}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpen(doc.id!)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onOpen(doc.id!);
                      }
                    }}
                    className="group relative flex w-full items-center gap-3 px-3 py-3.5 sm:px-4 sm:py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:bg-muted/50 cursor-pointer"
                  >
                    {/* Accent statut */}
                    <span className={cn("h-9 w-[3px] shrink-0 rounded-full", tone.dot)} aria-hidden />

                    {/* Monogramme client */}
                    <span
                      className={cn(
                        "hidden xs:flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                        tone.soft,
                        tone.text,
                      )}
                      aria-hidden
                    >
                      {initials}
                    </span>

                    {/* Identité */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2 min-w-0">
                        <p className="truncate text-[15px] font-semibold leading-tight tracking-tight">
                          {doc.client_name}
                        </p>
                      </div>
                      <p className="mt-1 truncate text-[12px] text-muted-foreground">
                        <span className="font-medium text-foreground/70">{doc.document_number}</span>
                        <span className="mx-1.5 text-border">•</span>
                        {format(new Date(doc.issue_date), "dd MMM yyyy", { locale: fr })}
                      </p>
                    </div>

                    {/* Montant + statut */}
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-bold leading-tight tabular-nums">
                        {formatAmount(doc.total_amount)}
                      </p>
                      <span
                        className={cn(
                          "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          tone.soft,
                          tone.text,
                        )}
                      >
                        {statusLabels[doc.status] ?? doc.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:hidden" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Actions du document"
                            className="hidden h-8 w-8 rounded-full text-muted-foreground hover:text-foreground group-hover:flex data-[state=open]:flex"
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
                    </div>
                  </div>
                 </SwipeToDelete>
                </li>

              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
