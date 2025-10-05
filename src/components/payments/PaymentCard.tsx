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
    return new Intl.NumberFormat('fr-FR', {
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
    return `${payment.customer_first_name || ''} ${payment.customer_last_name || ''}`.trim()
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy", { locale: fr })
  }

  return (
    <>
      <Card className="hover:shadow-large transition-shadow hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-surface-secondary p-2 rounded-lg">
              <StatusIcon className={cn("h-5 w-5", status.iconColor)} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-lg">
                {getFullName() || 'Client inconnu'}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn("text-xs", status.className)}>
                  {status.label}
                </Badge>
                {payment.payment_method && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MethodIcon className="h-3 w-3" />
                    <span>{methodLabel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Montant total</p>
              <p className="font-semibold text-foreground">
                {formatAmount(payment.total_amount)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Montant payé</p>
              <p className="font-semibold text-success">
                {formatAmount(payment.paid_amount)}
              </p>
            </div>
          </div>

          {/* Remaining amount */}
          {payment.remaining_amount > 0 && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reste à payer:</span>
                <span className="font-semibold text-warning">
                  {formatAmount(payment.remaining_amount)}
                </span>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div>
              <span>Payé le: </span>
              <span className="text-foreground">
                {formatDate(payment.payment_date)}
              </span>
            </div>
            {payment.due_date && (
              <div>
                <span>Échéance: </span>
                <span className={cn(
                  "font-medium",
                  new Date(payment.due_date) < new Date() && payment.status !== 'completed'
                    ? "text-destructive"
                    : "text-foreground"
                )}>
                  {formatDate(payment.due_date)}
                </span>
              </div>
            )}
          </div>

          {/* Phone */}
          {payment.customer_phone && (
            <div className="text-sm text-muted-foreground">
              <span>Tél: </span>
              <span className="text-foreground">{payment.customer_phone}</span>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="p-3 bg-surface-secondary rounded-lg">
              <p className="text-sm text-foreground">{payment.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      </Card>

      <EditPaymentDialog 
        payment={payment}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  )
}