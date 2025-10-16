import { useParams, useNavigate } from "react-router-dom";
import { useInvoiceDetails } from "@/hooks/useInvoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { exportInvoiceToPDF } from "@/lib/invoiceUtils";
import { Badge } from "@/components/ui/badge";

interface InvoicePreviewProps {
  documentType: 'facture' | 'devis';
}

export default function InvoicePreview({ documentType }: InvoicePreviewProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoiceDetails(id);

  const handleDownload = () => {
    if (invoice && invoice.items) {
      exportInvoiceToPDF(invoice, invoice.items);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!invoice) {
    return <div>Document non trouvé</div>;
  }

  const statusColors = {
    brouillon: "bg-gray-500",
    envoye: "bg-blue-500",
    paye: "bg-green-500",
    annule: "bg-red-500",
    accepte: "bg-green-500",
    refuse: "bg-red-500",
  };

  const statusLabels = {
    brouillon: "Brouillon",
    envoye: "Envoyé",
    paye: "Payé",
    annule: "Annulé",
    accepte: "Accepté",
    refuse: "Refusé",
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto px-4 md:px-6">
      {/* Header Actions - Responsive */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/app/${documentType === 'facture' ? 'factures' : 'devis'}`)}
              className="self-start"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {documentType === 'facture' ? 'Facture' : 'Devis'} {invoice.document_number}
            </h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handlePrint} className="flex-1 sm:flex-none">
              <Printer className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Imprimer</span>
              <span className="sm:hidden">Impr.</span>
            </Button>
            <Button onClick={handleDownload} className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Télécharger PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>
      </div>

      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-4 sm:p-6 md:p-8">
          {/* Header - Responsive Layout */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6 md:mb-8">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                {documentType === 'facture' ? 'FACTURE' : 'DEVIS'}
              </h2>
              <p className="text-base md:text-lg font-semibold">N° {invoice.document_number}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Date: {format(new Date(invoice.issue_date), 'dd/MM/yyyy', { locale: fr })}
              </p>
              {invoice.due_date && (
                <p className="text-sm text-muted-foreground">
                  Échéance: {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr })}
                </p>
              )}
              <div className="mt-2 print:hidden">
                <Badge className={statusColors[invoice.status]}>
                  {statusLabels[invoice.status]}
                </Badge>
              </div>
            </div>

            {invoice.company_name && (
              <div className="md:text-right flex flex-col md:items-end gap-1 md:gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                {invoice.company_logo_url && (
                  <img 
                    src={invoice.company_logo_url} 
                    alt="Logo entreprise" 
                    className="h-14 w-14 md:h-16 md:w-16 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-bold text-base md:text-lg">{invoice.company_name}</h3>
                {invoice.company_address && <p className="text-xs md:text-sm">{invoice.company_address}</p>}
                {(invoice.company_postal_code || invoice.company_city) && (
                  <p className="text-xs md:text-sm">{invoice.company_postal_code} {invoice.company_city}</p>
                )}
                {invoice.company_phone && <p className="text-xs md:text-sm">Tél: {invoice.company_phone}</p>}
                {invoice.company_email && <p className="text-xs md:text-sm">{invoice.company_email}</p>}
                {invoice.company_siret && <p className="text-xs md:text-sm">SIRET: {invoice.company_siret}</p>}
                {invoice.company_tva && <p className="text-xs md:text-sm">TVA: {invoice.company_tva}</p>}
              </div>
            )}
          </div>

          {/* Client */}
          <div className="bg-muted p-3 md:p-4 rounded-lg mb-6 md:mb-8">
            <h4 className="font-semibold mb-2 text-sm md:text-base">CLIENT</h4>
            <p className="font-medium text-sm md:text-base">{invoice.client_name}</p>
            {invoice.client_address && <p className="text-xs md:text-sm">{invoice.client_address}</p>}
            {(invoice.client_postal_code || invoice.client_city) && (
              <p className="text-xs md:text-sm">{invoice.client_postal_code} {invoice.client_city}</p>
            )}
            {invoice.client_email && <p className="text-xs md:text-sm">{invoice.client_email}</p>}
            {invoice.client_phone && <p className="text-xs md:text-sm">{invoice.client_phone}</p>}
          </div>

          {/* Items Table - Desktop View */}
          <div className="mb-6 md:mb-8 hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="text-left p-3 text-sm">Description</th>
                  <th className="text-center p-3 text-sm">Qté</th>
                  <th className="text-right p-3 text-sm">Prix Unit.</th>
                  <th className="text-center p-3 text-sm">Remise</th>
                  <th className="text-center p-3 text-sm">TVA</th>
                  <th className="text-right p-3 text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                    <td className="p-3 text-sm">{item.description}</td>
                    <td className="text-center p-3 text-sm">{item.quantity}</td>
                    <td className="text-right p-3 text-sm">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.unit_price)}
                    </td>
                    <td className="text-center p-3 text-sm">{item.discount_rate}%</td>
                    <td className="text-center p-3 text-sm">{item.tax_rate}%</td>
                    <td className="text-right p-3 text-sm font-medium">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Items List - Mobile View */}
          <div className="mb-6 md:hidden space-y-3">
            {invoice.items?.map((item, index) => (
              <div key={index} className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="font-medium text-sm">{item.description}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Quantité:</span>
                    <span className="ml-1 font-medium">{item.quantity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prix unit.:</span>
                    <span className="ml-1 font-medium">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.unit_price)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remise:</span>
                    <span className="ml-1 font-medium">{item.discount_rate}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">TVA:</span>
                    <span className="ml-1 font-medium">{item.tax_rate}%</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">Total:</span>
                  <span className="text-sm font-bold">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.total_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals - Responsive */}
          <div className="flex justify-end mb-6 md:mb-8">
            <div className="w-full md:w-80 space-y-2 bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Sous-total HT:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.subtotal)}
                </span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Remise:</span>
                  <span className="font-medium text-red-500">
                    -{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.discount_amount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">TVA:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.tax_amount)}
                </span>
              </div>
              <div className="flex justify-between text-base md:text-lg font-bold border-t pt-2 mt-2">
                <span>TOTAL TTC:</span>
                <span className="text-primary">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {invoice.notes && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-sm md:text-base">Notes:</h4>
              <p className="text-xs md:text-sm whitespace-pre-wrap text-muted-foreground">{invoice.notes}</p>
            </div>
          )}

          {invoice.terms && (
            <div>
              <h4 className="font-semibold mb-2 text-sm md:text-base">Conditions:</h4>
              <p className="text-xs md:text-sm whitespace-pre-wrap text-muted-foreground">{invoice.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
