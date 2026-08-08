import { Payment } from "@/hooks/usePayments"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Smartphone,
  Banknote,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react"
import React, { useState } from "react"
import { EditPaymentDialog } from "./EditPaymentDialog"
import { usePayments } from "@/hooks/usePayments"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface PaymentCardProps {
  payment: Payment
  onEdit?: (payment: Payment) => void
  onDelete?: (payment: Payment) => void
}

const paymentMethodIcons: Record<string, any> = {
  'especes': Banknote,
  'Espèces': Banknote,
  'orange_money': Smartphone,
  'Mobile Money': Smartphone,
  'mtn_money': Smartphone,
  'wave': Smartphone,
  'moov_money': Smartphone,
  'carte_bancaire': CreditCard,
  'Carte bancaire': CreditCard,
  'Virement': CreditCard,
  'Chèque': Banknote,
  'Autre': CreditCard
}

const paymentMethodLabels: Record<string, string> = {
  'especes': 'Espèces',
  'Espèces': 'Espèces',
  'orange_money': 'Orange Money',
  'Mobile Money': 'Mobile Money',
  'mtn_money': 'MTN Money',
  'wave': 'Wave',
  'moov_money': 'Moov Money',
  'carte_bancaire': 'Carte Bancaire',
  'Carte bancaire': 'Carte bancaire',
  'Virement': 'Virement',
  'Chèque': 'Chèque',
  'Autre': 'Autre'
}

const statusConfig = {
  'completed': {
    icon: CheckCircle,
    label: 'Payé',
    className: 'bg-success text-success-foreground',
    iconColor: 'text-success'
  },
  'pending': {
    icon: Clock,
    label: 'En attente',
    className: 'bg-warning text-warning-foreground',
    iconColor: 'text-warning'
  },
  'partial': {
    icon: AlertCircle,
    label: 'Partiellement payé',
    className: 'bg-info text-info-foreground',
    iconColor: 'text-info'
  },
  'overdue': {
    icon: AlertCircle,
    label: 'En retard',
    className: 'bg-destructive text-destructive-foreground',
    iconColor: 'text-destructive'
  }
} as const

export function PaymentCard({ payment, onEdit, onDelete }: PaymentCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { deletePayment } = usePayments();
  const status = statusConfig[payment.status] || statusConfig['pending']
  const StatusIcon = status.icon
  const MethodIcon = paymentMethodIcons[payment.payment_method] || CreditCard
  const methodLabel = paymentMethodLabels[payment.payment_method] || payment.payment_method

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount).replace('XOF', 'CFA')
  }

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      try {
        await deletePayment.mutateAsync(payment.id);
        toast.success('Paiement supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getFullName = () => {
    // Si customer_name existe (vente), l'utiliser en priorité
    if (payment.customer_name) {
      return payment.customer_name;
    }
    // Sinon utiliser first_name et last_name
    return `${payment.customer_first_name || ''} ${payment.customer_last_name || ''}`.trim()
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy", { locale: fr })
  }

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-4 shadow-soft transition-all hover:shadow-medium">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <StatusIcon className={cn("h-5 w-5", status.iconColor)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[15px] truncate leading-tight">{getFullName() || 'Client inconnu'}</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate">
              <MethodIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{methodLabel}</span>
              <span>·</span>
              <span>{formatDate(payment.payment_date)}</span>
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg shrink-0 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Payé</p>
            <p className="text-lg font-bold leading-tight text-success truncate">{formatAmount(payment.paid_amount)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="text-lg font-bold leading-tight">{formatAmount(payment.total_amount)}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
          <Badge className={cn("text-xs", status.className)}>{status.label}</Badge>
          {payment.remaining_amount > 0 ? (
            <span className="text-xs font-semibold text-warning">Reste {formatAmount(payment.remaining_amount)}</span>
          ) : payment.due_date ? (
            <span className="text-xs text-muted-foreground">Échéance {formatDate(payment.due_date)}</span>
          ) : null}
        </div>
      </div>


      <EditPaymentDialog 
        payment={payment}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  )
}