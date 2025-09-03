import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Receipt, Clock, CheckCircle, AlertCircle, Smartphone, Banknote } from "lucide-react"

// Mock data
const mockPayments = [
  {
    id: 1,
    customerName: "Marie Dupont",
    amount: 850000,
    method: "Orange Money",
    status: "completed",
    dueDate: "2024-01-15",
    paidDate: "2024-01-15",
    invoiceNumber: "INV-001",
    proofUrl: "/proof/payment-001.jpg"
  },
  {
    id: 2,
    customerName: "Paul Martin",
    amount: 570000,
    method: "Cash",
    status: "pending",
    dueDate: "2024-01-16",
    paidDate: null,
    invoiceNumber: "INV-002",
    proofUrl: null
  },
  {
    id: 3,
    customerName: "Sophie Durand",
    amount: 1200000,
    method: "Wave",
    status: "completed",
    dueDate: "2024-01-14",
    paidDate: "2024-01-14",
    invoiceNumber: "INV-003",
    proofUrl: "/proof/payment-003.jpg"
  },
  {
    id: 4,
    customerName: "Jean Kamara",
    amount: 555000,
    method: "Mobile Money",
    status: "overdue",
    dueDate: "2024-01-10",
    paidDate: null,
    invoiceNumber: "INV-004",
    proofUrl: null
  },
  {
    id: 5,
    customerName: "Fatou Ba",
    amount: 650000,
    method: "Orange Money",
    status: "completed",
    dueDate: "2024-01-13",
    paidDate: "2024-01-13",
    invoiceNumber: "INV-005",
    proofUrl: "/proof/payment-005.jpg"
  }
]

export default function Paiements() {
  const [payments, setPayments] = useState(mockPayments)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPayments = payments.filter(payment =>
    payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paymentStats = {
    totalPayments: payments.length,
    completedPayments: payments.filter(p => p.status === "completed").length,
    pendingPayments: payments.filter(p => p.status === "pending").length,
    overduePayments: payments.filter(p => p.status === "overdue").length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status !== "completed").reduce((sum, p) => sum + p.amount, 0)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Payé</Badge>
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>
      case "overdue":
        return <Badge className="bg-destructive text-destructive-foreground">En retard</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Receipt className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getMethodIcon = (method: string) => {
    if (method === "Cash") {
      return <Banknote className="h-4 w-4 text-muted-foreground" />
    }
    return <Smartphone className="h-4 w-4 text-muted-foreground" />
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price).replace('XOF', 'CFA')
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const markAsPaid = (id: number) => {
    setPayments(payments.map(payment => 
      payment.id === id 
        ? { ...payment, status: "completed", paidDate: new Date().toISOString().split('T')[0] }
        : payment
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des paiements</h1>
          <p className="text-muted-foreground">
            Suivez et gérez tous vos paiements clients
          </p>
        </div>
        
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau paiement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Payés</p>
                <p className="text-xl font-bold text-success">{paymentStats.completedPayments}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(paymentStats.paidAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-xl font-bold text-warning">{paymentStats.pendingPayments}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(paymentStats.pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">En retard</p>
                <p className="text-xl font-bold text-destructive">{paymentStats.overduePayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total à recevoir</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(paymentStats.totalAmount)}</p>
              <p className="text-xs text-success">
                {((paymentStats.paidAmount / paymentStats.totalAmount) * 100).toFixed(1)}% reçu
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recherche et filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par client ou numéro de facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Tous
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-success border-success">
                Payés ({paymentStats.completedPayments})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-warning border-warning">
                En attente ({paymentStats.pendingPayments})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-destructive border-destructive">
                En retard ({paymentStats.overduePayments})
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Liste des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-muted p-2 rounded-lg">
                    {getStatusIcon(payment.status)}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{payment.customerName}</h4>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>Facture: {payment.invoiceNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getMethodIcon(payment.method)}
                        <span>{payment.method}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>Échéance: {formatDate(payment.dueDate)}</span>
                      {payment.paidDate && (
                        <span>Payé le: {formatDate(payment.paidDate)}</span>
                      )}
                      {payment.proofUrl && (
                        <Badge variant="outline" className="text-xs">
                          Preuve jointe
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{formatPrice(payment.amount)}</p>
                  </div>
                  
                  {payment.status === "pending" && (
                    <Button 
                      size="sm" 
                      className="bg-gradient-success hover:opacity-90"
                      onClick={() => markAsPaid(payment.id)}
                    >
                      Marquer payé
                    </Button>
                  )}
                  
                  {payment.status === "overdue" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Relancer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Aucun paiement trouvé
              </h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche ou ajoutez votre premier paiement.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}