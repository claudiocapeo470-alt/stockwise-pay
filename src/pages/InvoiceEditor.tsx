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
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { calculateItemTotals, calculateInvoiceTotals } from "@/lib/invoiceUtils";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { ClientLogoUpload } from "@/components/invoices/ClientLogoUpload";

interface InvoiceEditorProps {
  documentType: 'facture' | 'devis';
}

const STEPS = [
  { label: "Client", emoji: "👤" },
  { label: "Document", emoji: "📄" },
  { label: "Articles", emoji: "📦" },
  { label: "Résumé", emoji: "✅" },
];

export default function InvoiceEditor({ documentType }: InvoiceEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const { addInvoice, updateInvoice } = useInvoices(documentType);
  const { data: existingInvoice, isLoading: loadingInvoice } = useInvoiceDetails(id);
  const { settings } = useCompanySettings();
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);

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
    client_logo_url: '',
    company_name: '',
    company_address: '',
    company_city: '',
    company_postal_code: '',
    company_phone: '',
    company_email: '',
    company_siret: '',
    company_tva: '',
    company_logo_url: '',
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
    { description: '', quantity: 1, unit_price: 0, tax_rate: 0, discount_rate: 0, position: 0 }
  ]);

  useEffect(() => {
    if (existingInvoice && !isNew) {
      setInvoice(existingInvoice);
      if (existingInvoice.items) setItems(existingInvoice.items);
    } else if (isNew && settings) {
      setInvoice(prev => ({
        ...prev,
        company_name: settings.company_name || '',
        company_address: settings.company_address || '',
        company_city: settings.company_city || '',
        company_postal_code: settings.company_postal_code || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        company_siret: settings.company_siret || '',
        company_tva: settings.company_tva || '',
        company_logo_url: settings.logo_url || '',
      }));
    }
  }, [existingInvoice, isNew, settings]);

  useEffect(() => {
    const calculatedItems = items.map((item, index) => ({ ...calculateItemTotals(item), position: index }));
    const totals = calculateInvoiceTotals(calculatedItems as InvoiceItem[]);
    setInvoice(prev => ({ ...prev, ...totals }));
  }, [items]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, tax_rate: 0, discount_rate: 0, position: items.length }]);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = async (status?: Invoice['status']) => {
    const calculatedItems = items.map((item, index) => ({ ...calculateItemTotals(item), position: index })) as InvoiceItem[];
    const totals = calculateInvoiceTotals(calculatedItems);
    const invoiceData: Invoice = {
      ...invoice as Invoice,
      ...totals,
      status: status || invoice.status as Invoice['status'],
      items: calculatedItems,
      due_date: invoice.due_date || null,
    };
    try {
      if (isNew) await addInvoice(invoiceData);
      else await updateInvoice({ ...invoiceData, id });
      navigate(`/app/${documentType === 'facture' ? 'factures' : 'devis'}`);
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  if (loadingInvoice && !isNew) {
    return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner /></div>;
  }

  const title = isNew
    ? `${documentType === 'facture' ? 'Nouvelle Facture' : 'Nouveau Devis'}`
    : `Modifier ${documentType === 'facture' ? 'Facture' : 'Devis'} ${invoice.document_number}`;

  const canNext = step === 0 ? !!invoice.client_name?.trim() : true;

  const fmtAmount = (val: number) =>
    isMobile ? `${Math.round(val).toLocaleString()} F` : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/app/${documentType === 'facture' ? 'factures' : 'devis'}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg sm:text-2xl font-bold truncate">{title}</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => i <= step && setStep(i)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              i === step
                ? 'bg-primary text-primary-foreground'
                : i < step
                ? 'bg-primary/20 text-primary cursor-pointer'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <span>{i < step ? '✓' : s.emoji}</span>
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">{i + 1}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Client */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base sm:text-lg">👤 Informations Client</CardTitle></CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div><Label className="text-xs sm:text-sm">Nom du client *</Label><Input value={invoice.client_name} onChange={e => setInvoice({ ...invoice, client_name: e.target.value })} className="text-sm" /></div>
            <div><Label className="text-xs sm:text-sm">Email</Label><Input type="email" value={invoice.client_email} onChange={e => setInvoice({ ...invoice, client_email: e.target.value })} className="text-sm" /></div>
            <div><Label className="text-xs sm:text-sm">Téléphone</Label><Input value={invoice.client_phone} onChange={e => setInvoice({ ...invoice, client_phone: e.target.value })} className="text-sm" /></div>
            <div><Label className="text-xs sm:text-sm">Adresse</Label><Input value={invoice.client_address} onChange={e => setInvoice({ ...invoice, client_address: e.target.value })} className="text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs sm:text-sm">Code postal</Label><Input value={invoice.client_postal_code} onChange={e => setInvoice({ ...invoice, client_postal_code: e.target.value })} className="text-sm" /></div>
              <div><Label className="text-xs sm:text-sm">Ville</Label><Input value={invoice.client_city} onChange={e => setInvoice({ ...invoice, client_city: e.target.value })} className="text-sm" /></div>
            </div>
            <ClientLogoUpload currentLogoUrl={invoice.client_logo_url || undefined} onLogoChange={url => setInvoice({ ...invoice, client_logo_url: url || '' })} />
          </CardContent>
        </Card>
      )}

      {/* Step 2: Document info */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base sm:text-lg">📄 Informations du Document</CardTitle></CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <Label className="text-xs sm:text-sm">Statut</Label>
              <Select value={invoice.status} onValueChange={value => setInvoice({ ...invoice, status: value as Invoice['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="envoye">Envoyé</SelectItem>
                  {documentType === 'facture' ? (
                    <><SelectItem value="paye">Payé</SelectItem><SelectItem value="annule">Annulé</SelectItem></>
                  ) : (
                    <><SelectItem value="accepte">Accepté</SelectItem><SelectItem value="refuse">Refusé</SelectItem><SelectItem value="annule">Annulé</SelectItem></>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs sm:text-sm">Date d'émission *</Label><Input type="date" value={invoice.issue_date} onChange={e => setInvoice({ ...invoice, issue_date: e.target.value })} className="text-sm" /></div>
            <div><Label className="text-xs sm:text-sm">Date d'échéance</Label><Input type="date" value={invoice.due_date} onChange={e => setInvoice({ ...invoice, due_date: e.target.value })} className="text-sm" /></div>
            <div><Label className="text-xs sm:text-sm">Notes</Label><Textarea value={invoice.notes} onChange={e => setInvoice({ ...invoice, notes: e.target.value })} placeholder="Notes complémentaires..." rows={3} className="text-sm" /></div>
            <div><Label className="text-xs sm:text-sm">Conditions de paiement</Label><Textarea value={invoice.terms} onChange={e => setInvoice({ ...invoice, terms: e.target.value })} placeholder="Conditions et modalités..." rows={3} className="text-sm" /></div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Items */}
      {step === 2 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">📦 Articles / Prestations</CardTitle>
              <Button onClick={addItem} size="sm"><Plus className="h-4 w-4 mr-1" /> Ajouter</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1"><Label className="text-xs">Description *</Label><Input value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} placeholder="Description..." className="text-sm" /></div>
                  {items.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="mt-5 h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div><Label className="text-xs">Quantité</Label><Input type="number" min="1" step="0.01" value={item.quantity} onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)} className="text-xs" /></div>
                  <div><Label className="text-xs">Prix Unit.</Label><Input type="number" min="0" step="0.01" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} className="text-xs" /></div>
                  <div><Label className="text-xs">Remise (%)</Label><Input type="number" min="0" max="100" value={item.discount_rate} onChange={e => updateItem(index, 'discount_rate', parseFloat(e.target.value) || 0)} className="text-xs" /></div>
                  <div><Label className="text-xs">TVA (%)</Label><Input type="number" min="0" max="100" value={item.tax_rate || ''} onChange={e => updateItem(index, 'tax_rate', e.target.value === '' ? 0 : parseFloat(e.target.value))} placeholder="0" className="text-xs" /></div>
                  <div><Label className="text-xs">Total TTC</Label><Input value={fmtAmount(calculateItemTotals(item).total_amount)} disabled className="bg-muted text-xs font-medium" /></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Summary */}
      {step === 3 && (
        <div className="space-y-4">
          {!settings && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="pt-4"><p className="text-xs text-yellow-800 dark:text-yellow-200">⚠️ Configurez vos informations d'entreprise dans les paramètres.</p></CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle className="text-base">Récapitulatif</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-muted-foreground">Client</p>
                  <p className="font-bold">{invoice.client_name}</p>
                  {invoice.client_email && <p className="text-muted-foreground">{invoice.client_email}</p>}
                  {invoice.client_phone && <p className="text-muted-foreground">{invoice.client_phone}</p>}
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-muted-foreground">Document</p>
                  <p>Date : {invoice.issue_date}</p>
                  {invoice.due_date && <p>Échéance : {invoice.due_date}</p>}
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted"><tr><th className="text-left p-2">Description</th><th className="text-right p-2">Qté</th><th className="text-right p-2">Total</th></tr></thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-t"><td className="p-2">{item.description || '—'}</td><td className="text-right p-2">{item.quantity}</td><td className="text-right p-2 font-medium">{fmtAmount(calculateItemTotals(item).total_amount)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="max-w-xs ml-auto space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Sous-total HT</span><span>{fmtAmount(invoice.subtotal || 0)}</span></div>
                {(invoice.discount_amount || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Remise</span><span className="text-green-600">-{fmtAmount(invoice.discount_amount || 0)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">TVA</span><span>{fmtAmount(invoice.tax_amount || 0)}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>TOTAL TTC</span><span>{fmtAmount(invoice.total_amount || 0)}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pb-6">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} size={isMobile ? "sm" : "default"}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Précédent
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext} size={isMobile ? "sm" : "default"}>
            Suivant <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => handleSave('envoye')} size={isMobile ? "sm" : "default"} className="gap-2">
            <Save className="h-4 w-4" />
            {documentType === 'facture' ? 'Créer la Facture' : 'Créer le Devis'}
          </Button>
        )}
      </div>
    </div>
  );
}
