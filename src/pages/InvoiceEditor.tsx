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
      tax_rate: 20,
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
      tax_rate: 20,
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/app/${documentType === 'facture' ? 'factures' : 'devis'}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('brouillon')}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
          <Button onClick={() => handleSave('envoye')}>
            Enregistrer et Envoyer
          </Button>
        </div>
      </div>

      {!settings && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              ⚠️ Configurez vos informations d'entreprise dans les paramètres pour qu'elles apparaissent sur vos documents.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client_name">Nom du client *</Label>
              <Input
                id="client_name"
                value={invoice.client_name}
                onChange={(e) => setInvoice({ ...invoice, client_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="client_email">Email</Label>
              <Input
                id="client_email"
                type="email"
                value={invoice.client_email}
                onChange={(e) => setInvoice({ ...invoice, client_email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="client_phone">Téléphone</Label>
              <Input
                id="client_phone"
                value={invoice.client_phone}
                onChange={(e) => setInvoice({ ...invoice, client_phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="client_address">Adresse</Label>
              <Input
                id="client_address"
                value={invoice.client_address}
                onChange={(e) => setInvoice({ ...invoice, client_address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_postal_code">Code postal</Label>
                <Input
                  id="client_postal_code"
                  value={invoice.client_postal_code}
                  onChange={(e) => setInvoice({ ...invoice, client_postal_code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="client_city">Ville</Label>
                <Input
                  id="client_city"
                  value={invoice.client_city}
                  onChange={(e) => setInvoice({ ...invoice, client_city: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Statut</Label>
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
              <Label htmlFor="issue_date">Date d'émission *</Label>
              <Input
                id="issue_date"
                type="date"
                value={invoice.issue_date}
                onChange={(e) => setInvoice({ ...invoice, issue_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="due_date">Date d'échéance</Label>
              <Input
                id="due_date"
                type="date"
                value={invoice.due_date}
                onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Articles / Prestations</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une ligne
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Description de l'article..."
                      required
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <Label>Quantité</Label>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Prix Unit. (XOF)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Remise (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.discount_rate}
                      onChange={(e) => updateItem(index, 'discount_rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>TVA (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.tax_rate}
                      onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Total TTC</Label>
                    <Input
                      value={new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(
                        calculateItemTotals(item).total_amount
                      )}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 border-t pt-6">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total HT:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.subtotal || 0)}
                </span>
              </div>
              {(invoice.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remise:</span>
                  <span className="font-medium text-green-600">
                    -{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.discount_amount || 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.tax_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>TOTAL TTC:</span>
                <span>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.total_amount || 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes and Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={invoice.notes}
              onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
              placeholder="Notes complémentaires..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conditions de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={invoice.terms}
              onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
              placeholder="Conditions et modalités de paiement..."
              rows={4}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
