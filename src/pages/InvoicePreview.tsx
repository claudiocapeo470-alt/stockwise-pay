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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/app/${documentType === 'facture' ? 'factures' : 'devis'}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">
            {documentType === 'facture' ? 'Facture' : 'Devis'} {invoice.document_number}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">
                {documentType === 'facture' ? 'FACTURE' : 'DEVIS'}
              </h2>
              <p className="text-lg font-semibold">N° {invoice.document_number}</p>
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
              <div className="text-right flex flex-col items-end gap-2">
                {invoice.company_logo_url && (
                  <img 
                    src={invoice.company_logo_url} 
                    alt="Logo entreprise" 
                    className="h-16 w-16 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-bold text-lg">{invoice.company_name}</h3>
                {invoice.company_address && <p className="text-sm">{invoice.company_address}</p>}
                {(invoice.company_postal_code || invoice.company_city) && (
                  <p className="text-sm">{invoice.company_postal_code} {invoice.company_city}</p>
                )}
                {invoice.company_phone && <p className="text-sm">Tél: {invoice.company_phone}</p>}
                {invoice.company_email && <p className="text-sm">{invoice.company_email}</p>}
                {invoice.company_siret && <p className="text-sm">SIRET: {invoice.company_siret}</p>}
                {invoice.company_tva && <p className="text-sm">TVA: {invoice.company_tva}</p>}
              </div>
            )}
          </div>

          {/* Client */}
          <div className="bg-muted p-4 rounded-lg mb-8">
            <h4 className="font-semibold mb-2">CLIENT</h4>
            <p className="font-medium">{invoice.client_name}</p>
            {invoice.client_address && <p className="text-sm">{invoice.client_address}</p>}
            {(invoice.client_postal_code || invoice.client_city) && (
              <p className="text-sm">{invoice.client_postal_code} {invoice.client_city}</p>
            )}
            {invoice.client_email && <p className="text-sm">{invoice.client_email}</p>}
            {invoice.client_phone && <p className="text-sm">{invoice.client_phone}</p>}
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="text-left p-3">Description</th>
                  <th className="text-center p-3">Qté</th>
                  <th className="text-right p-3">Prix Unit.</th>
                  <th className="text-center p-3">Remise</th>
                  <th className="text-center p-3">TVA</th>
                  <th className="text-right p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                    <td className="p-3">{item.description}</td>
                    <td className="text-center p-3">{item.quantity}</td>
                    <td className="text-right p-3">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.unit_price)}
                    </td>
                    <td className="text-center p-3">{item.discount_rate}%</td>
                    <td className="text-center p-3">{item.tax_rate}%</td>
                    <td className="text-right p-3 font-medium">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total HT:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.subtotal)}
                </span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remise:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.discount_amount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.tax_amount)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>TOTAL TTC:</span>
                <span>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {invoice.notes && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Notes:</h4>
              <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {invoice.terms && (
            <div>
              <h4 className="font-semibold mb-2">Conditions:</h4>
              <p className="text-sm whitespace-pre-wrap">{invoice.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
