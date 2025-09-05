import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, TrendingUp, BarChart3, PieChart, Calendar, Eye, Plus } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { useSales } from "@/hooks/useSales"
import { usePayments } from "@/hooks/usePayments"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { ReportDialog } from "@/components/reports/ReportDialog"
import { CustomReportDialog } from "@/components/reports/CustomReportDialog"

const reports = [
  {
    id: 1,
    title: "Rapport des ventes",
    description: "Analyse détaillée des ventes par période",
    type: "sales",
    period: "Cette semaine",
    status: "ready",
    lastGenerated: "2024-01-15",
    metrics: {
      totalSales: 15,
      revenue: 4825000,
      growth: "+12%"
    }
  },
  {
    id: 2,
    title: "État des stocks",
    description: "Inventaire et mouvements de stock",
    type: "inventory",
    period: "Temps réel",
    status: "ready",
    lastGenerated: "2024-01-15",
    metrics: {
      totalProducts: 156,
      lowStock: 8,
      outOfStock: 3
    }
  },
  {
    id: 3,
    title: "Suivi des paiements",
    description: "Paiements reçus et en attente",
    type: "payments",
    period: "Ce mois",
    status: "ready",
    lastGenerated: "2024-01-15",
    metrics: {
      paid: "85%",
      pending: 1125000,
      overdue: 555000
    }
  },
  {
    id: 4,
    title: "Clients les plus rentables",
    description: "Top des clients par chiffre d'affaires",
    type: "customers",
    period: "Trimestre",
    status: "generating",
    lastGenerated: "2024-01-14",
    metrics: {
      topCustomers: 5,
      averageSpend: 580000,
      retention: "78%"
    }
  }
]

const quickExports = [
  {
    title: "Ventes aujourd'hui",
    description: "Export CSV des ventes d'aujourd'hui",
    icon: BarChart3,
    format: "CSV"
  },
  {
    title: "Stock complet",
    description: "Export Excel de l'inventaire complet",
    icon: PieChart,
    format: "Excel"
  },
  {
    title: "Paiements en retard",
    description: "Liste des paiements en retard",
    icon: Calendar,
    format: "PDF"
  }
]

export default function Rapports() {
  const { products = [] } = useProducts()
  const { sales = [] } = useSales()
  const { payments = [] } = usePayments()
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showCustomReportDialog, setShowCustomReportDialog] = useState(false)

  // Calculate real metrics
  const metrics = useMemo(() => {
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
    const totalProducts = products.length
    const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity).length
    const outOfStockProducts = products.filter(p => p.quantity === 0).length
    const completedPayments = payments.filter(p => p.status === 'completed')
    const pendingPayments = payments.filter(p => p.status === 'pending')
    const totalPaid = completedPayments.reduce((sum, p) => sum + Number(p.total_amount), 0)
    const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.total_amount), 0)

    return {
      totalSales,
      totalRevenue,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalPaid,
      totalPending,
      paymentRate: payments.length > 0 ? Math.round((completedPayments.length / payments.length) * 100) : 0
    }
  }, [products, sales, payments])

  const handleExport = (type: 'csv' | 'excel' | 'pdf', data: string) => {
    let content = ''
    let filename = ''
    let mimeType = ''

    if (type === 'csv') {
      if (data === 'sales') {
        content = 'Date,Produit,Client,Quantité,Prix unitaire,Total\n'
        sales.forEach(sale => {
          const product = products.find(p => p.id === sale.product_id)
          content += `${new Date(sale.created_at).toLocaleDateString()},${product?.name || 'N/A'},${sale.customer_name || 'N/A'},${sale.quantity},${sale.unit_price},${sale.total_amount}\n`
        })
      } else if (data === 'products') {
        content = 'Nom,Catégorie,Prix,Quantité,Stock minimum\n'
        products.forEach(product => {
          content += `${product.name},${product.category || 'N/A'},${product.price},${product.quantity},${product.min_quantity}\n`
        })
      } else if (data === 'payments') {
        content = 'Date,Client,Montant,Méthode,Statut\n'
        payments.forEach(payment => {
          const fullName = `${payment.customer_first_name || ''} ${payment.customer_last_name || ''}`.trim() || 'N/A'
          content += `${new Date(payment.created_at).toLocaleDateString()},${fullName},${payment.total_amount},${payment.payment_method},${payment.status}\n`
        })
      }
      filename = `${data}_${new Date().toISOString().split('T')[0]}.csv`
      mimeType = 'text/csv'
    }

    if (content) {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Export ${filename} téléchargé avec succès`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-success text-success-foreground">Prêt</Badge>
      case "generating":
        return <Badge className="bg-warning text-warning-foreground">En cours</Badge>
      case "error":
        return <Badge className="bg-destructive text-destructive-foreground">Erreur</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sales":
        return <TrendingUp className="h-5 w-5 text-primary" />
      case "inventory":
        return <BarChart3 className="h-5 w-5 text-success" />
      case "payments":
        return <PieChart className="h-5 w-5 text-warning" />
      case "customers":
        return <Calendar className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price).replace('XOF', 'CFA')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Rapports et analyses</h1>
        <p className="text-muted-foreground">
          Générez et consultez vos rapports d'activité
        </p>
      </div>

      {/* Quick Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exports rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent"
              onClick={() => handleExport('csv', 'sales')}
            >
              <div className="flex items-center gap-2 w-full">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Ventes aujourd'hui</span>
                <Badge variant="outline" className="ml-auto text-xs">CSV</Badge>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Export CSV des ventes d'aujourd'hui
              </p>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent"
              onClick={() => handleExport('csv', 'products')}
            >
              <div className="flex items-center gap-2 w-full">
                <PieChart className="h-4 w-4" />
                <span className="font-medium">Stock complet</span>
                <Badge variant="outline" className="ml-auto text-xs">CSV</Badge>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Export CSV de l'inventaire complet
              </p>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent"
              onClick={() => handleExport('csv', 'payments')}
            >
              <div className="flex items-center gap-2 w-full">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Tous les paiements</span>
                <Badge variant="outline" className="ml-auto text-xs">CSV</Badge>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Export CSV de tous les paiements
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Report */}
        <Card className="hover:shadow-medium transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Rapport des ventes</CardTitle>
                  <p className="text-sm text-muted-foreground">Analyse détaillée des ventes par période</p>
                </div>
              </div>
              <Badge className="bg-success text-success-foreground">Prêt</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Période:</span>
              <span className="font-medium text-foreground">Temps réel</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dernière mise à jour:</span>
              <span className="font-medium text-foreground">{new Date().toLocaleDateString('fr-FR')}</span>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium text-foreground">Aperçu des données</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Ventes</p>
                  <p className="font-medium">{metrics.totalSales}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">CA</p>
                  <p className="font-medium">{metrics.totalRevenue.toLocaleString()} CFA</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Evolution</p>
                  <p className="font-medium text-success">+0%</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-primary hover:opacity-90"
                onClick={() => {
                  setSelectedReportType('sales');
                  setShowReportDialog(true);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                Voir le rapport
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleExport('csv', 'sales')}
              >
                <Download className="h-4 w-4 mr-1" />
                Exporter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Report */}
        <Card className="hover:shadow-medium transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-success" />
                <div>
                  <CardTitle className="text-lg">État des stocks</CardTitle>
                  <p className="text-sm text-muted-foreground">Inventaire et mouvements de stock</p>
                </div>
              </div>
              <Badge className="bg-success text-success-foreground">Prêt</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Période:</span>
              <span className="font-medium text-foreground">Temps réel</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dernière mise à jour:</span>
              <span className="font-medium text-foreground">{new Date().toLocaleDateString('fr-FR')}</span>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium text-foreground">Aperçu des données</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Produits</p>
                  <p className="font-medium">{metrics.totalProducts}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stock bas</p>
                  <p className="font-medium text-warning">{metrics.lowStockProducts}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Épuisé</p>
                  <p className="font-medium text-destructive">{metrics.outOfStockProducts}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-primary hover:opacity-90"
                onClick={() => {
                  setSelectedReportType('inventory');
                  setShowReportDialog(true);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                Voir le rapport
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleExport('csv', 'products')}
              >
                <Download className="h-4 w-4 mr-1" />
                Exporter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Report */}
        <Card className="hover:shadow-medium transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <PieChart className="h-5 w-5 text-warning" />
                <div>
                  <CardTitle className="text-lg">Suivi des paiements</CardTitle>
                  <p className="text-sm text-muted-foreground">Paiements reçus et en attente</p>
                </div>
              </div>
              <Badge className="bg-success text-success-foreground">Prêt</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Période:</span>
              <span className="font-medium text-foreground">Temps réel</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dernière mise à jour:</span>
              <span className="font-medium text-foreground">{new Date().toLocaleDateString('fr-FR')}</span>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium text-foreground">Aperçu des données</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Payé</p>
                  <p className="font-medium text-success">{metrics.paymentRate}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">En attente</p>
                  <p className="font-medium text-warning">{metrics.totalPending.toLocaleString()} CFA</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reçu</p>
                  <p className="font-medium text-success">{metrics.totalPaid.toLocaleString()} CFA</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-primary hover:opacity-90"
                onClick={() => {
                  setSelectedReportType('payments');
                  setShowReportDialog(true);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                Voir le rapport
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleExport('csv', 'payments')}
              >
                <Download className="h-4 w-4 mr-1" />
                Exporter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Report */}
        <Card className="hover:shadow-medium transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <CardTitle className="text-lg">Rapport personnalisé</CardTitle>
                  <p className="text-sm text-muted-foreground">Créez votre rapport sur mesure</p>
                </div>
              </div>
              <Badge variant="outline">Disponible</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium text-foreground">Personnalisable</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Données:</span>
              <span className="font-medium text-foreground">Toutes disponibles</span>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium text-foreground">Options disponibles</h4>
              <div className="text-xs text-muted-foreground">
                • Sélection de période personnalisée<br/>
                • Filtres par catégorie/client<br/>
                • Formats multiples (CSV, PDF)
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-primary hover:opacity-90"
                onClick={() => toast.info("Fonctionnalité en développement")}
              >
                <FileText className="h-4 w-4 mr-1" />
                Créer rapport
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legacy reports section - hidden but kept for reference */}
      <div className="hidden">
        {[].map((report) => (
          <Card key={report.id} className="hover:shadow-medium transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(report.type)}
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                {getStatusBadge(report.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Période:</span>
                <span className="font-medium text-foreground">{report.period}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dernière génération:</span>
                <span className="font-medium text-foreground">{formatDate(report.lastGenerated)}</span>
              </div>

              {/* Metrics Preview */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <h4 className="text-sm font-medium text-foreground">Aperçu des données</h4>
                {report.type === "sales" && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Ventes</p>
                      <p className="font-medium">{report.metrics.totalSales}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CA</p>
                      <p className="font-medium">{formatPrice(report.metrics.revenue as number)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Evolution</p>
                      <p className="font-medium text-success">{report.metrics.growth}</p>
                    </div>
                  </div>
                )}
                
                {report.type === "inventory" && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Produits</p>
                      <p className="font-medium">{report.metrics.totalProducts}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stock bas</p>
                      <p className="font-medium text-warning">{report.metrics.lowStock}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Épuisé</p>
                      <p className="font-medium text-destructive">{report.metrics.outOfStock}</p>
                    </div>
                  </div>
                )}
                
                {report.type === "payments" && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Payé</p>
                      <p className="font-medium text-success">{report.metrics.paid}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">En attente</p>
                      <p className="font-medium text-warning">{formatPrice(report.metrics.pending as number)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">En retard</p>
                      <p className="font-medium text-destructive">{formatPrice(report.metrics.overdue as number)}</p>
                    </div>
                  </div>
                )}
                
                {report.type === "customers" && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Top clients</p>
                      <p className="font-medium">{report.metrics.topCustomers}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Panier moyen</p>
                      <p className="font-medium">{formatPrice(report.metrics.averageSpend as number)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rétention</p>
                      <p className="font-medium">{report.metrics.retention}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                  disabled={report.status === "generating"}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Voir le rapport
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled={report.status === "generating"}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exporter
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generate Custom Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Générer un rapport personnalisé</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Créez un rapport sur mesure en sélectionnant les données et la période qui vous intéressent.
          </p>
          <Button className="bg-gradient-primary hover:opacity-90">
            <FileText className="h-4 w-4 mr-2" />
            Nouveau rapport personnalisé
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}