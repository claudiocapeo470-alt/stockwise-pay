import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Receipt } from "lucide-react"
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
          variant="ghost"
          className="w-full justify-start h-auto p-4 hover:bg-accent"
        >
          <div className="p-2 rounded-lg mr-3 bg-warning dark:bg-gradient-warning hover:opacity-90">
            <Receipt className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <div className="font-medium text-foreground dark:text-foreground">Paiement reçu</div>
            <div className="text-sm text-gray-700 dark:text-muted-foreground">Marquer comme payé</div>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Nouveau paiement
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Information */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-foreground border-b border-border pb-1.5">
              Informations client
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground">
                  Prénom *
                </Label>
                <Input
                  id="firstName"
                  value={formData.customer_first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_first_name: e.target.value }))}
                  placeholder="Prénom du client"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground">
                  Nom *
                </Label>
                <Input
                  id="lastName"
                  value={formData.customer_last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_last_name: e.target.value }))}
                  placeholder="Nom du client"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Téléphone
              </Label>
              <Input
                id="phone"
                value={formData.customer_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                placeholder="Numéro de téléphone"
              />
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-foreground border-b border-border pb-1.5">
              Détails du paiement
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="method" className="text-foreground">
                Méthode de paiement *
              </Label>
              <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value as Payment['payment_method'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount" className="text-foreground">
                  Montant total *
                </Label>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
                  placeholder="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paidAmount" className="text-foreground">
                  Montant payé
                </Label>
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
              <div className="p-3 bg-surface-secondary rounded-lg border border-border text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Reste à payer:</span>
                  <span className={cn(
                    "font-semibold text-lg",
                    remainingAmount > 0 ? "text-warning" : "text-success"
                  )}>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                      minimumFractionDigits: 0
                    }).format(remainingAmount).replace('XOF', 'CFA')}
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-muted-foreground">
                  État: {
                    remainingAmount === 0 ? (
                      <span className="text-success font-medium">Payé</span>
                    ) : Number(formData.paid_amount) > 0 ? (
                      <span className="text-warning font-medium">Partiellement payé</span>
                    ) : (
                      <span className="text-muted-foreground font-medium">En attente</span>
                    )
                  }
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-foreground border-b border-border pb-1.5">
              Dates
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Date du paiement</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.payment_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.payment_date ? format(formData.payment_date, "PPP", { locale: fr }) : "Sélectionner une date"}
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
              
              <div className="space-y-2">
                <Label className="text-foreground">Date d'échéance</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.due_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(formData.due_date, "PPP", { locale: fr }) : "Optionnel"}
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
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={addPayment.isPending}
              className="bg-success hover:bg-success/90"
            >
              {addPayment.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}