import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyStateCard } from "@/components/onboarding/EmptyStateCard"
import { AddPaymentDialog } from "@/components/payments/AddPaymentDialog"
import { PaymentCard } from "@/components/payments/PaymentCard"
import { usePayments } from "@/hooks/usePayments"
import { useIsMobile } from "@/hooks/use-mobile"
import { 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Receipt,
  Grid3x3,
  List
} from "lucide-react"

export default function Paiements() {
  const { payments, isLoading } = usePayments()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const isMobile = useIsMobile()

  const filteredPayments = payments.filter(payment => {
    const fullName = `${payment.customer_first_name || ''} ${payment.customer_last_name || ''}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         payment.customer_phone?.includes(searchTerm) ||
                         false
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter
    return matchesSearch && matchesStatus && matchesMethod
  })

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
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount).replace('XOF', 'CFA')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success">Payé</Badge>
      case 'pending': return <Badge variant="warning">En attente</Badge>
      case 'partial': return <Badge variant="secondary">Partiel</Badge>
      case 'overdue': return <Badge variant="destructive">En retard</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card><CardContent className="p-4 flex items-center gap-4"><div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl"><Receipt className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">0</p><p className="text-sm text-muted-foreground">Total Paiements</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><div className="h-10 w-10 bg-success/10 flex items-center justify-center rounded-xl"><CheckCircle className="h-5 w-5 text-success" /></div><div><p className="text-2xl font-bold">0</p><p className="text-sm text-muted-foreground">Payés</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><div className="h-10 w-10 bg-warning/10 flex items-center justify-center rounded-xl"><Clock className="h-5 w-5 text-warning" /></div><div><p className="text-2xl font-bold">0</p><p className="text-sm text-muted-foreground">En attente</p></div></CardContent></Card>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Rechercher..." disabled className="pl-10" />
          </div>
          <AddPaymentDialog />
        </div>
        <EmptyStateCard icon={Receipt} title="Aucun paiement enregistré" description="Commencez par enregistrer votre premier paiement client pour suivre vos encaissements." />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{paymentStats.totalPayments}</p>
              <p className="text-sm text-muted-foreground">Total Paiements</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-success/10 flex items-center justify-center rounded-xl">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{paymentStats.completedPayments}</p>
              <p className="text-sm text-muted-foreground">Payés</p>
            </div>
          </CardContent>
        </Card>
        <Card className={paymentStats.overduePayments > 0 ? "border-destructive/30" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-destructive/10 flex items-center justify-center rounded-xl">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{paymentStats.overduePayments}</p>
              <p className="text-sm text-muted-foreground">En retard</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-warning/10 flex items-center justify-center rounded-xl">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatAmount(paymentStats.remainingAmount)}</p>
              <p className="text-sm text-muted-foreground">Reste à recevoir</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Rechercher par nom ou téléphone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="completed">Payés</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="partial">Partiels</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Méthode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="especes">Espèces</SelectItem>
              <SelectItem value="orange_money">Orange Money</SelectItem>
              <SelectItem value="mtn_money">MTN Money</SelectItem>
              <SelectItem value="wave">Wave</SelectItem>
              <SelectItem value="carte_bancaire">Carte</SelectItem>
            </SelectContent>
          </Select>
          {!isMobile && (
            <>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}><Grid3x3 className="h-4 w-4" /></Button>
            </>
          )}
          <AddPaymentDialog />
        </div>
      </div>

      {/* Content */}
      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun paiement trouvé</h3>
            <p className="text-muted-foreground mb-4">Essayez de modifier vos critères de recherche.</p>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setMethodFilter("all"); }}>Réinitialiser les filtres</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* List view */}
          {!isMobile && viewMode === "list" && (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Payé</TableHead>
                    <TableHead className="text-right">Reste</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                            <Receipt className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.customer_first_name} {payment.customer_last_name}</p>
                            {payment.customer_phone && <p className="text-xs text-muted-foreground">{payment.customer_phone}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{payment.payment_method}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{payment.total_amount.toLocaleString()} FCFA</TableCell>
                      <TableCell className="text-right">{payment.paid_amount.toLocaleString()} FCFA</TableCell>
                      <TableCell className="text-right">{payment.remaining_amount.toLocaleString()} FCFA</TableCell>
                      <TableCell className="text-center">{getStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Grid view */}
          {(isMobile || viewMode === "grid") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onEdit={(payment) => console.log('Edit payment:', payment)}
                  onDelete={(payment) => console.log('Delete payment:', payment)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
