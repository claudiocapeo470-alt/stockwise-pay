import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Receipt, CreditCard } from "lucide-react"
import { DialogHead } from "@/components/ui/dialog-head"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { usePayments, Payment } from "@/hooks/usePayments"
import { fr } from "date-fns/locale"

interface AddPaymentDialogProps {
  onSuccess?: () => void
}

const paymentMethods = [
  { value: 'especes', label: 'Espèces' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'mtn_money', label: 'MTN Money' },
  { value: 'wave', label: 'Wave' },
  { value: 'moov_money', label: 'Moov Money' },
  { value: 'carte_bancaire', label: 'Carte Bancaire' }
] as const

export function AddPaymentDialog({ onSuccess }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    customer_first_name: "",
    customer_last_name: "",
    customer_phone: "",
    payment_method: "" as Payment['payment_method'],
    total_amount: "",
    paid_amount: "",
    payment_date: new Date(),
    due_date: null as Date | null,
    notes: ""
  })

  const { addPayment } = usePayments()

  const remainingAmount = Number(formData.total_amount) - Number(formData.paid_amount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customer_first_name || !formData.customer_last_name || !formData.payment_method || !formData.total_amount) {
      return
    }

    const paymentData = {
      customer_name: null,
      customer_first_name: formData.customer_first_name,
      customer_last_name: formData.customer_last_name,
      customer_phone: formData.customer_phone || null,
      payment_method: formData.payment_method,
      total_amount: Number(formData.total_amount),
      paid_amount: Number(formData.paid_amount) || 0,
      payment_date: formData.payment_date.toISOString(),
      due_date: formData.due_date?.toISOString() || null,
      notes: formData.notes || null,
      sale_id: null,
      proof_image_url: null,
      status: 'pending' // This will be automatically calculated by the trigger
    } as const

    await addPayment.mutateAsync(paymentData)
    
    // Reset form
    setFormData({
      customer_first_name: "",
      customer_last_name: "",
      customer_phone: "",
      payment_method: "" as Payment['payment_method'],
      total_amount: "",
      paid_amount: "",
      payment_date: new Date(),
      due_date: null,
      notes: ""
    })
    
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-medium hover:shadow-glow transition-all duration-300 rounded-xl h-auto py-3 px-4 sm:py-3.5 sm:px-5 flex items-center justify-center gap-2 sm:gap-3 group"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform duration-300" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-center sm:text-left">
            <span className="font-semibold text-sm sm:text-base">Paiement reçu</span>
            <span className="hidden sm:inline text-xs sm:text-sm opacity-90">•</span>
            <span className="text-xs sm:text-sm opacity-90">Marquer comme payé</span>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-sm sm:max-w-md max-h-[88vh] flex flex-col gap-0 p-4 sm:p-6 rounded-2xl">
        <DialogHead
          icon={step === 1 ? Receipt : CreditCard}
          title={step === 1 ? "Nouveau paiement · Client" : "Nouveau paiement · Montant"}
          subtitle={step === 1 ? "Identité et téléphone" : "Méthode, montants et dates"}
          step={step}
          totalSteps={2}
        />

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-3 [&_label]:text-[13px] [&_label]:font-medium [&_input]:h-11 [&_input]:rounded-xl [&_button[role=combobox]]:h-11 [&_button[role=combobox]]:rounded-xl">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.customer_first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_first_name: e.target.value }))}
                      placeholder="Prénom"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.customer_last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_last_name: e.target.value }))}
                      placeholder="Nom"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Téléphone</Label>
                  <PhoneInput
                    id="phone"
                    value={formData.customer_phone}
                    onChange={(value) => setFormData(prev => ({ ...prev, customer_phone: value || "" }))}
                    placeholder="Numéro de téléphone"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Informations complémentaires..."
                    rows={2}
                    className="rounded-xl"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="method">Méthode de paiement *</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value as Payment['payment_method'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="totalAmount">Montant total *</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.total_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="paidAmount">Montant payé</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, paid_amount: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                {formData.total_amount && (
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm">
                    <span className="text-muted-foreground">Reste à payer</span>
                    <span className={cn("font-semibold tabular-nums", remainingAmount > 0 ? "text-warning" : "text-success")}>
                      {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(remainingAmount).replace(/\u202f|\u00a0/g, ' ')} FCFA
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Date du paiement</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-11 rounded-xl justify-start text-left font-normal text-[13px] px-3">
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate">{format(formData.payment_date, "dd MMM yyyy", { locale: fr })}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.payment_date}
                          onSelect={(date) => date && setFormData(prev => ({ ...prev, payment_date: date }))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Date d'échéance</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full h-11 rounded-xl justify-start text-left font-normal text-[13px] px-3", !formData.due_date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate">{formData.due_date ? format(formData.due_date, "dd MMM yyyy", { locale: fr }) : "Optionnel"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.due_date || undefined}
                          onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date || null }))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 pt-3 mt-1 border-t border-border/60 [&_button]:h-11 [&_button]:flex-1 [&_button]:rounded-xl">
            {step === 1 ? (
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => setStep(1)}>Précédent</Button>
            )}
            {step === 1 ? (
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.customer_first_name.trim() || !formData.customer_last_name.trim()}
              >
                Suivant
              </Button>
            ) : (
              <Button type="submit" disabled={addPayment.isPending || !formData.payment_method || !formData.total_amount}>
                {addPayment.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}