import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, TrendingUp, BarChart3, PieChart, Calendar } from "lucide-react"

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
            {quickExports.map((exportItem, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent"
              >
                <div className="flex items-center gap-2 w-full">
                  <exportItem.icon className="h-4 w-4" />
                  <span className="font-medium">{exportItem.title}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {exportItem.format}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  {exportItem.description}
                </p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => (
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