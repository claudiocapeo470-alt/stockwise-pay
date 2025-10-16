import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInvoices, useInvoiceDetails, Invoice, InvoiceItem } from "@/hooks/useInvoices";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { calculateItemTotals, calculateInvoiceTotals } from "@/lib/invoiceUtils";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface InvoiceEditorProps {
  documentType: 'facture' | 'devis';
}

export default function InvoiceEditor({ documentType }: InvoiceEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const { addInvoice, updateInvoice } = useInvoices(documentType);
  const { data: existingInvoice, isLoading: loadingInvoice } = useInvoiceDetails(id);
  const { settings } = useCompanySettings();
  const isMobile = useIsMobile();

  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    document_type: documentType,
    document_number: '',
    status: 'brouillon',
    client_name: '',
    client_address: '',
    client_city: '',
    client_postal_code: '',
    client_email: '',
    client_phone: '',
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: '',
    notes: '',
    terms: '',
  });

  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    {
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
      discount_rate: 0,
      position: 0,
    }
  ]);

  useEffect(() => {
    if (existingInvoice && !isNew) {
      setInvoice(existingInvoice);
      if (existingInvoice.items) {
        setItems(existingInvoice.items);
      }
    }
  }, [existingInvoice, isNew]);

  useEffect(() => {
    const calculatedItems = items.map((item, index) => ({
      ...calculateItemTotals(item),
      position: index,
    }));
    const totals = calculateInvoiceTotals(calculatedItems as InvoiceItem[]);
    
    setInvoice(prev => ({
      ...prev,
      ...totals,
    }));
  }, [items]);

  const addItem = () => {
    setItems([...items, {
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
      discount_rate: 0,
      position: items.length,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = async (status?: Invoice['status']) => {
    const calculatedItems = items.map((item, index) => ({
      ...calculateItemTotals(item),
      position: index,
    })) as InvoiceItem[];

    const totals = calculateInvoiceTotals(calculatedItems);

    const invoiceData: Invoice = {
      ...invoice as Invoice,
      ...totals,
      status: status || invoice.status as Invoice['status'],
      items: calculatedItems,
      // Convert empty strings to null for optional date fields
      due_date: invoice.due_date || null,
    };

    try {
      if (isNew) {
        await addInvoice(invoiceData);
      } else {
        await updateInvoice({ ...invoiceData, id });
      }
      navigate(`/app/${documentType === 'facture' ? 'factures' : 'devis'}`);
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  if (loadingInvoice && !isNew) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const title = isNew 
    ? `Nouvelle ${documentType === 'facture' ? 'Facture' : 'Devis'}`
    : `Modifier ${documentType === 'facture' ? 'Facture' : 'Devis'} ${invoice.document_number}`;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size={isMobile ? "icon" : "sm"}
            onClick={() => navigate(`/app/${documentType === 'facture' ? 'factures' : 'devis'}`)}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Retour</span>}
          </Button>
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold truncate">{title}</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSave('brouillon')}
            size={isMobile ? "sm" : "default"}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {isMobile ? "Enregistrer" : "Enregistrer"}
          </Button>
          <Button 
            onClick={() => handleSave('envoye')}
            size={isMobile ? "sm" : "default"}
            className="w-full sm:w-auto"
          >
            {isMobile ? "Envoyer" : "Enregistrer et Envoyer"}
          </Button>
        </div>
      </div>

      {!settings && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Configurez vos informations d'entreprise dans les paramètres pour qu'elles apparaissent sur vos documents.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Informations Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="client_name" className="text-xs sm:text-sm">Nom du client *</Label>
              <Input
                id="client_name"
                value={invoice.client_name}
                onChange={(e) => setInvoice({ ...invoice, client_name: e.target.value })}
                required
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="client_email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="client_email"
                type="email"
                value={invoice.client_email}
                onChange={(e) => setInvoice({ ...invoice, client_email: e.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="client_phone" className="text-xs sm:text-sm">Téléphone</Label>
              <Input
                id="client_phone"
                value={invoice.client_phone}
                onChange={(e) => setInvoice({ ...invoice, client_phone: e.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="client_address" className="text-xs sm:text-sm">Adresse</Label>
              <Input
                id="client_address"
                value={invoice.client_address}
                onChange={(e) => setInvoice({ ...invoice, client_address: e.target.value })}
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="client_postal_code" className="text-xs sm:text-sm">Code postal</Label>
                <Input
                  id="client_postal_code"
                  value={invoice.client_postal_code}
                  onChange={(e) => setInvoice({ ...invoice, client_postal_code: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="client_city" className="text-xs sm:text-sm">Ville</Label>
                <Input
                  id="client_city"
                  value={invoice.client_city}
                  onChange={(e) => setInvoice({ ...invoice, client_city: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Information */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Informations du Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="status" className="text-xs sm:text-sm">Statut</Label>
              <Select
                value={invoice.status}
                onValueChange={(value) => setInvoice({ ...invoice, status: value as Invoice['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="envoye">Envoyé</SelectItem>
                  {documentType === 'facture' ? (
                    <>
                      <SelectItem value="paye">Payé</SelectItem>
                      <SelectItem value="annule">Annulé</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="accepte">Accepté</SelectItem>
                      <SelectItem value="refuse">Refusé</SelectItem>
                      <SelectItem value="annule">Annulé</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="issue_date" className="text-xs sm:text-sm">Date d'émission *</Label>
              <Input
                id="issue_date"
                type="date"
                value={invoice.issue_date}
                onChange={(e) => setInvoice({ ...invoice, issue_date: e.target.value })}
                required
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="due_date" className="text-xs sm:text-sm">Date d'échéance</Label>
              <Input
                id="due_date"
                type="date"
                value={invoice.due_date}
                onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base sm:text-lg">Articles / Prestations</CardTitle>
            <Button onClick={addItem} size={isMobile ? "sm" : "default"} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 sm:p-4 space-y-3">
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm">Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Description..."
                      required
                      className="text-sm"
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="mt-5 sm:mt-6 h-8 w-8 shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                  <div>
                    <Label className="text-xs">Quantité</Label>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Prix Unit.</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Remise (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.discount_rate}
                      onChange={(e) => updateItem(index, 'discount_rate', parseFloat(e.target.value) || 0)}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">TVA (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.tax_rate || ''}
                      onChange={(e) => updateItem(index, 'tax_rate', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      placeholder="0"
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label className="text-xs">Total TTC</Label>
                    <Input
                      value={isMobile 
                        ? `${Math.round(calculateItemTotals(item).total_amount).toLocaleString()} F`
                        : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(
                          calculateItemTotals(item).total_amount
                        )}
                      disabled
                      className="bg-muted text-xs sm:text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 sm:mt-6 border-t pt-4 sm:pt-6">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Sous-total HT:</span>
                <span className="font-medium">
                  {isMobile 
                    ? `${Math.round(invoice.subtotal || 0).toLocaleString()} F`
                    : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.subtotal || 0)}
                </span>
              </div>
              {(invoice.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Remise:</span>
                  <span className="font-medium text-green-600">
                    -{isMobile 
                      ? `${Math.round(invoice.discount_amount || 0).toLocaleString()} F`
                      : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.discount_amount || 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">TVA:</span>
                <span className="font-medium">
                  {isMobile 
                    ? `${Math.round(invoice.tax_amount || 0).toLocaleString()} F`
                    : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.tax_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-2">
                <span>TOTAL TTC:</span>
                <span>
                  {isMobile 
                    ? `${Math.round(invoice.total_amount || 0).toLocaleString()} F`
                    : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.total_amount || 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes and Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={invoice.notes}
              onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
              placeholder="Notes complémentaires..."
              rows={4}
              className="text-xs sm:text-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Conditions de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={invoice.terms}
              onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
              placeholder="Conditions et modalités..."
              rows={4}
              className="text-xs sm:text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
