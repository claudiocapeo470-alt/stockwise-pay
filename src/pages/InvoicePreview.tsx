import { useParams, useNavigate } from "react-router-dom";
import { useInvoiceDetails } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { exportInvoiceToPDF } from "@/lib/invoiceUtils";
import { useCurrency } from "@/hooks/useCurrency";

interface InvoicePreviewProps {
  documentType: 'facture' | 'devis';
}

const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  paye: "Payé",
  annule: "Annulé",
  accepte: "Accepté",
  refuse: "Refusé",
};

export default function InvoicePreview({ documentType }: InvoicePreviewProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoiceDetails(id);
  const { formatCurrency } = useCurrency();

  const handleDownload = () => {
    if (invoice && invoice.items) exportInvoiceToPDF(invoice, invoice.items);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!invoice) return <div className="p-6 text-center text-muted-foreground">Document non trouvé</div>;

  const title = documentType === 'facture' ? 'FACTURE' : 'DEVIS';

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto px-3 sm:px-6">
      {/* Actions */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="self-start">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()} className="flex-1 sm:flex-none rounded-xl">
            <Printer className="h-4 w-4 mr-2" /> Imprimer
          </Button>
          <Button onClick={handleDownload} className="flex-1 sm:flex-none rounded-xl">
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      {/* Document */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm print:shadow-none print:border-0 print:rounded-none">
        {/* Bandeau navy */}
        <div className="bg-primary text-primary-foreground p-5 sm:p-7 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {invoice.company_logo_url && (
              <img
                src={invoice.company_logo_url}
                alt={invoice.company_name || "Logo"}
                className="h-14 w-14 rounded-xl bg-white object-contain p-1 shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="font-bold text-base sm:text-lg truncate">{invoice.company_name || "—"}</p>
              <div className="text-[11px] sm:text-xs opacity-80 leading-relaxed mt-1 space-y-0.5">
                {invoice.company_address && <p className="truncate">{invoice.company_address}</p>}
                {(invoice.company_postal_code || invoice.company_city) && (
                  <p className="truncate">{invoice.company_postal_code} {invoice.company_city}</p>
                )}
                {invoice.company_phone && <p className="truncate">Tél : {invoice.company_phone}</p>}
                {invoice.company_email && <p className="truncate">{invoice.company_email}</p>}
              </div>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</p>
            <p className="text-xs sm:text-sm opacity-90 mt-1">N° {invoice.document_number}</p>
            <span className="inline-block mt-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
              {STATUS_LABELS[invoice.status] || invoice.status}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-7 space-y-6">
          {/* Cartes client / dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {documentType === 'facture' ? 'Facturé à' : 'Destinataire'}
              </p>
              <div className="flex items-start gap-3">
                {invoice.client_logo_url && (
                  <img
                    src={invoice.client_logo_url}
                    alt={invoice.client_name}
                    className="h-11 w-11 rounded-lg border border-border bg-background object-contain p-1 shrink-0"
                  />
                )}
                <div className="min-w-0 text-sm">
                  <p className="font-semibold truncate">{invoice.client_name}</p>
                  <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                    {invoice.client_address && <p className="truncate">{invoice.client_address}</p>}
                    {(invoice.client_postal_code || invoice.client_city) && (
                      <p className="truncate">{invoice.client_postal_code} {invoice.client_city}</p>
                    )}
                    {invoice.client_phone && <p className="truncate">{invoice.client_phone}</p>}
                    {invoice.client_email && <p className="truncate">{invoice.client_email}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col justify-between gap-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Date d'émission</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {format(new Date(invoice.issue_date), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                {invoice.due_date && (
                  <div>
                    <p className="text-muted-foreground">Échéance</p>
                    <p className="font-semibold text-sm mt-0.5">
                      {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                )}
              </div>
              <div className="rounded-lg bg-primary px-3 py-2 flex items-center justify-between text-primary-foreground">
                <span className="text-[11px] font-semibold uppercase tracking-wide">Total TTC</span>
                <span className="font-bold tabular-nums">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Articles — tableau desktop */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="text-left p-3 font-semibold">Description</th>
                  <th className="text-center p-3 font-semibold">Qté</th>
                  <th className="text-right p-3 font-semibold">Prix unit.</th>
                  <th className="text-center p-3 font-semibold">Remise</th>
                  <th className="text-center p-3 font-semibold">TVA</th>
                  <th className="text-right p-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className={index % 2 === 1 ? 'bg-muted/40' : ''}>
                    <td className="p-3 align-top">{item.description}</td>
                    <td className="p-3 text-center tabular-nums">{item.quantity}</td>
                    <td className="p-3 text-right tabular-nums">{formatCurrency(item.unit_price)}</td>
                    <td className="p-3 text-center tabular-nums">{item.discount_rate}%</td>
                    <td className="p-3 text-center tabular-nums">{item.tax_rate}%</td>
                    <td className="p-3 text-right font-semibold tabular-nums">{formatCurrency(item.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Articles — cartes mobile */}
          <div className="md:hidden space-y-3">
            {invoice.items?.map((item, index) => (
              <div key={index} className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="font-medium text-sm">{item.description}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
                  <p>Qté : <span className="font-medium text-foreground tabular-nums">{item.quantity}</span></p>
                  <p>PU : <span className="font-medium text-foreground tabular-nums">{formatCurrency(item.unit_price)}</span></p>
                  <p>Remise : <span className="font-medium text-foreground">{item.discount_rate}%</span></p>
                  <p>TVA : <span className="font-medium text-foreground">{item.tax_rate}%</span></p>
                </div>
                <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase text-muted-foreground">Total</span>
                  <span className="font-bold text-sm tabular-nums">{formatCurrency(item.total_amount)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totaux */}
          <div className="flex justify-end">
            <div className="w-full md:w-80 rounded-xl border border-border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total HT</span>
                <span className="font-medium tabular-nums">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remise</span>
                  <span className="font-medium text-destructive tabular-nums">-{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span className="font-medium tabular-nums">{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="mt-2 rounded-lg bg-primary px-3 py-2 flex items-center justify-between text-primary-foreground">
                <span className="text-xs font-bold uppercase tracking-wide">Total TTC</span>
                <span className="text-base font-bold tabular-nums">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Notes / conditions */}
          {(invoice.notes || invoice.terms) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {invoice.notes && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                  <p className="text-xs whitespace-pre-wrap text-foreground/80">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Conditions</p>
                  <p className="text-xs whitespace-pre-wrap text-foreground/80">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
