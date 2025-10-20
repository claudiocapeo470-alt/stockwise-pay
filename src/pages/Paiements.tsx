import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { EmptyStateCard } from "@/components/onboarding/EmptyStateCard"
import { AddPaymentDialog } from "@/components/payments/AddPaymentDialog"
import { PaymentCard } from "@/components/payments/PaymentCard"
import { usePayments } from "@/hooks/usePayments"
import { 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Filter,
  Receipt
} from "lucide-react"

export default function Paiements() {
  const { payments, isLoading } = usePayments()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")

  // Filtrer les paiements
  const filteredPayments = payments.filter(payment => {
    const fullName = `${payment.customer_first_name || ''} ${payment.customer_last_name || ''}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         payment.customer_phone?.includes(searchTerm) ||
                         false

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  // Statistiques
  const paymentStats = {
    totalPayments: payments.length,
    completedPayments: payments.filter(p => p.status === "completed").length,
    pendingPayments: payments.filter(p => p.status === "pending").length,
    partialPayments: payments.filter(p => p.status === "partial").length,
    overduePayments: payments.filter(p => p.status === "overdue").length,
    totalAmount: payments.reduce((sum, p) => sum + p.total_amount, 0),
    paidAmount: payments.reduce((sum, p) => sum + p.paid_amount, 0),
    remainingAmount: payments.reduce((sum, p) => sum + p.remaining_amount, 0)
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount).replace('XOF', 'CFA')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des paiements</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  // Interface vierge si aucun paiement
  if (payments.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-secondary bg-clip-text text-transparent">Gestion des paiements</h1>
            <p className="text-muted-foreground">
              Suivez et gérez tous vos paiements clients
            </p>
          </div>
          
          <AddPaymentDialog />
        </div>

        {/* Empty State */}
        <EmptyStateCard
          icon={Receipt}
          title="Aucun paiement enregistré"
          description="Commencez par enregistrer votre premier paiement client pour suivre vos encaissements."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Block with Description and Button */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800/40 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">Gestion des paiements</h2>
          <p className="text-blue-700 dark:text-blue-300">Suivez et gérez tous vos paiements clients</p>
        </div>
        <AddPaymentDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500 shadow-md">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">Payés</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{paymentStats.completedPayments}</p>
                <p className="text-xs text-green-700 dark:text-green-300">{formatAmount(paymentStats.paidAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-200 dark:border-amber-800/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500 shadow-md">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">En attente</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{paymentStats.pendingPayments}</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {paymentStats.partialPayments > 0 && `+ ${paymentStats.partialPayments} partiels`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500 shadow-md">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">En retard</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{paymentStats.overduePayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500 shadow-md">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Reste à recevoir</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatAmount(paymentStats.remainingAmount)}</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {paymentStats.totalAmount > 0 ? 
                    `${((paymentStats.paidAmount / paymentStats.totalAmount) * 100).toFixed(1)}% reçu` :
                    '0% reçu'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Recherche et filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, prénom ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="completed">Payés ({paymentStats.completedPayments})</SelectItem>
                    <SelectItem value="pending">En attente ({paymentStats.pendingPayments})</SelectItem>
                    <SelectItem value="partial">Partiels ({paymentStats.partialPayments})</SelectItem>
                    <SelectItem value="overdue">En retard ({paymentStats.overduePayments})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les méthodes</SelectItem>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="orange_money">Orange Money</SelectItem>
                    <SelectItem value="mtn_money">MTN Money</SelectItem>
                    <SelectItem value="wave">Wave</SelectItem>
                    <SelectItem value="moov_money">Moov Money</SelectItem>
                    <SelectItem value="carte_bancaire">Carte Bancaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters */}
            <div className="flex gap-2 flex-wrap">
              {statusFilter !== "all" && (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setStatusFilter("all")}
                >
                  Statut: {statusFilter} ×
                </Badge>
              )}
              {methodFilter !== "all" && (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setMethodFilter("all")}
                >
                  Méthode: {methodFilter} ×
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onEdit={(payment) => {
                  // TODO: Implement edit functionality
                  console.log('Edit payment:', payment)
                }}
                onDelete={(payment) => {
                  // TODO: Implement delete functionality
                  console.log('Delete payment:', payment)
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Aucun paiement trouvé
              </h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche ou de filtrage.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setMethodFilter("all")
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}