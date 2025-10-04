import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePayments } from "@/hooks/usePayments";
import { toast } from "sonner";
import { format } from "date-fns";

interface Payment {
  id: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  total_amount: number;
  paid_amount: number;
  payment_method: string;
  status: string;
  due_date?: string;
  notes?: string;
}

interface EditPaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPaymentDialog({ payment, open, onOpenChange }: EditPaymentDialogProps) {
  const { updatePayment } = usePayments();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_first_name: payment?.customer_first_name || "",
    customer_last_name: payment?.customer_last_name || "",
    customer_phone: payment?.customer_phone || "",
    total_amount: payment?.total_amount || 0,
    paid_amount: payment?.paid_amount || 0,
    payment_method: payment?.payment_method || "especes",
    due_date: payment?.due_date ? format(new Date(payment.due_date), 'yyyy-MM-dd') : "",
    notes: payment?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    setIsSubmitting(true);
    try {
      await updatePayment.mutateAsync({
        id: payment.id,
        customer_first_name: formData.customer_first_name,
        customer_last_name: formData.customer_last_name,
        customer_phone: formData.customer_phone,
        total_amount: Number(formData.total_amount),
        paid_amount: Number(formData.paid_amount),
        payment_method: formData.payment_method as any,
        due_date: formData.due_date || null,
        notes: formData.notes,
      });
      
      onOpenChange(false);
      toast.success("Paiement modifié avec succès");
    } catch (error) {
      toast.error("Erreur lors de la modification du paiement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Reset form when payment changes
  React.useEffect(() => {
    if (payment) {
      setFormData({
        customer_first_name: payment.customer_first_name || "",
        customer_last_name: payment.customer_last_name || "",
        customer_phone: payment.customer_phone || "",
        total_amount: payment.total_amount || 0,
        paid_amount: payment.paid_amount || 0,
        payment_method: payment.payment_method || "especes",
        due_date: payment.due_date ? format(new Date(payment.due_date), 'yyyy-MM-dd') : "",
        notes: payment.notes || "",
      });
    }
  }, [payment]);

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Modifier le paiement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.customer_first_name}
                onChange={(e) => handleInputChange("customer_first_name", e.target.value)}
                placeholder="Prénom du client"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.customer_last_name}
                onChange={(e) => handleInputChange("customer_last_name", e.target.value)}
                placeholder="Nom du client"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.customer_phone}
              onChange={(e) => handleInputChange("customer_phone", e.target.value)}
              placeholder="+225 XX XX XX XX XX"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalAmount">Montant total *</Label>
              <Input
                id="totalAmount"
                type="number"
                min="0"
                value={formData.total_amount}
                onChange={(e) => handleInputChange("total_amount", Number(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="paidAmount">Montant payé *</Label>
              <Input
                id="paidAmount"
                type="number"
                min="0"
                value={formData.paid_amount}
                onChange={(e) => handleInputChange("paid_amount", Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Méthode de paiement *</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => handleInputChange("payment_method", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="especes">Espèces</SelectItem>
                <SelectItem value="orange_money">Orange Money</SelectItem>
                <SelectItem value="mtn_money">MTN Mobile Money</SelectItem>
                <SelectItem value="wave">Wave</SelectItem>
                <SelectItem value="moov_money">Moov Money</SelectItem>
                <SelectItem value="carte_bancaire">Carte bancaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate">Date d'échéance</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange("due_date", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Notes additionnelles..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}