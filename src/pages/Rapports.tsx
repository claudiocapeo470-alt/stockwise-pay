import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, TrendingUp, BarChart3, PieChart, Calendar, Eye } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { useSales } from "@/hooks/useSales"
import { usePayments } from "@/hooks/usePayments"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { ReportDialog } from "@/components/reports/ReportDialog"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useIsMobile } from "@/hooks/use-mobile"

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
    title: "Rapport paiements",
    description: "Export PDF des paiements",
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
  const isMobile = useIsMobile()

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
    if (type === 'excel') {
      handleExcelExport(data)
      return
    }

    if (type === 'pdf') {
      handlePDFExport(data)
      return
    }

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

  const handleExcelExport = (data: string) => {
    const wb = XLSX.utils.book_new()
    let wsData: any[][] = []
    let title = ''
    
    // Préparer les données selon le type
    if (data === 'sales') {
      title = 'RAPPORT DES VENTES'
      wsData = [
        [title], // Titre principal
        [], // Ligne vide
        [`Généré le: ${new Date().toLocaleDateString('fr-FR')}`], // Date
        [`Nombre total de ventes: ${sales.length}`], // Statistiques
        [`Chiffre d'affaires total: ${metrics.totalRevenue.toLocaleString()} CFA`],
        [], // Ligne vide
        ['Date', 'Produit', 'Client', 'Quantité', 'Prix unitaire (CFA)', 'Total (CFA)'] // En-têtes
      ]
      
      sales.forEach(sale => {
        const product = products.find(p => p.id === sale.product_id)
        wsData.push([
          new Date(sale.created_at).toLocaleDateString('fr-FR'),
          product?.name || 'N/A',
          sale.customer_name || 'N/A',
          sale.quantity,
          Number(sale.unit_price),
          Number(sale.total_amount)
        ])
      })
    } else if (data === 'products') {
      title = 'INVENTAIRE COMPLET'
      wsData = [
        [title],
        [],
        [`Généré le: ${new Date().toLocaleDateString('fr-FR')}`],
        [`Nombre total de produits: ${products.length}`],
        [`Valeur totale du stock: ${products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()} CFA`],
        [],
        ['Nom', 'Catégorie', 'Prix (CFA)', 'Quantité', 'Stock minimum', 'Valeur stock (CFA)']
      ]
      
      products.forEach(product => {
        wsData.push([
          product.name,
          product.category || 'N/A',
          Number(product.price),
          product.quantity,
          product.min_quantity,
          Number(product.price) * product.quantity
        ])
      })
    } else if (data === 'payments') {
      title = 'RAPPORT DES PAIEMENTS'
      wsData = [
        [title],
        [],
        [`Généré le: ${new Date().toLocaleDateString('fr-FR')}`],
        [`Nombre total de paiements: ${payments.length}`],
        [`Montant total encaissé: ${metrics.totalPaid.toLocaleString()} CFA`],
        [`Montant en attente: ${metrics.totalPending.toLocaleString()} CFA`],
        [],
        ['Date', 'Client', 'Montant (CFA)', 'Méthode', 'Statut', 'Téléphone']
      ]
      
      payments.forEach(payment => {
        const fullName = `${payment.customer_first_name || ''} ${payment.customer_last_name || ''}`.trim() || 'N/A'
        wsData.push([
          new Date(payment.created_at).toLocaleDateString('fr-FR'),
          fullName,
          Number(payment.total_amount),
          payment.payment_method,
          payment.status,
          payment.customer_phone || 'N/A'
        ])
      })
    }

    // Créer la feuille de calcul
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    
    // Appliquer le formatage
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    
    // Titre principal (A1) - Gras et centré
    ws['A1'].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: 'E3F2FD' } }
    }
    
    // Fusionner les cellules pour le titre
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } }]
    
    // En-têtes de colonnes (ligne 7) - Gras avec bordures
    const headerRow = 6
    for (let col = 0; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col })
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true },
          alignment: { horizontal: 'center', vertical: 'center' },
          fill: { fgColor: { rgb: 'F5F5F5' } },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        }
      }
    }
    
    // Appliquer les bordures aux données
    for (let row = headerRow + 1; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
        if (ws[cellRef]) {
          ws[cellRef].s = {
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            },
            alignment: { vertical: 'center' }
          }
          
          // Formater les montants
          if (typeof ws[cellRef].v === 'number' && col >= 4) {
            ws[cellRef].s.numFmt = '#,##0'
          }
        }
      }
    }
    
    // Ajuster la largeur des colonnes
    const colWidths = wsData[headerRow]?.map(() => ({ wch: 15 })) || []
    ws['!cols'] = colWidths
    
    // Ajouter la feuille au classeur
    XLSX.utils.book_append_sheet(wb, ws, title)
    
    // Télécharger le fichier
    const filename = `${data}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, filename)
    
    toast.success(`Export Excel ${filename} téléchargé avec succès`)
  }

  const handlePDFExport = (data: string) => {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let currentY = 20

    // Configuration des couleurs et styles
    const primaryColor: [number, number, number] = [59, 130, 246] // Bleu primary
    const secondaryColor: [number, number, number] = [107, 114, 128] // Gris
    const successColor: [number, number, number] = [34, 197, 94] // Vert
    const warningColor: [number, number, number] = [251, 191, 36] // Orange
    const errorColor: [number, number, number] = [239, 68, 68] // Rouge

    // Fonction pour ajouter l'en-tête
    const addHeader = (title: string) => {
      // Titre principal
      doc.setFontSize(24)
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setFont('helvetica', 'bold')
      doc.text(title, pageWidth / 2, currentY, { align: 'center' })
      currentY += 15

      // Ligne de séparation
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setLineWidth(0.5)
      doc.line(20, currentY, pageWidth - 20, currentY)
      currentY += 10

      // Date de génération
      doc.setFontSize(12)
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.setFont('helvetica', 'normal')
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, currentY)
      currentY += 15
    }

    // Fonction pour ajouter les statistiques
    const addStats = (stats: { label: string; value: string; color?: [number, number, number] }[]) => {
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text('STATISTIQUES GÉNÉRALES', 20, currentY)
      currentY += 10

      stats.forEach((stat, index) => {
        const x = 20 + (index % 2) * (pageWidth / 2 - 20)
        const y = currentY + Math.floor(index / 2) * 8

        doc.setFontSize(10)
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
        doc.setFont('helvetica', 'normal')
        doc.text(`${stat.label}:`, x, y)
        
        const color = stat.color || [0, 0, 0] as [number, number, number]
        doc.setTextColor(color[0], color[1], color[2])
        doc.setFont('helvetica', 'bold')
        doc.text(stat.value, x + 50, y)
      })

      currentY += Math.ceil(stats.length / 2) * 8 + 10
    }

    if (data === 'sales') {
      addHeader('RAPPORT DÉTAILLÉ DES VENTES')
      
      const stats = [
        { label: 'Nombre total de ventes', value: `${metrics.totalSales}`, color: primaryColor },
        { label: 'Chiffre d\'affaires total', value: `${metrics.totalRevenue.toLocaleString()} CFA`, color: successColor },
        { label: 'Valeur moyenne par vente', value: `${metrics.totalSales > 0 ? formatAmountForPDF(Math.round(metrics.totalRevenue / metrics.totalSales)) : '0'} CFA`, color: primaryColor },
        { label: 'Nombre de produits vendus', value: `${sales.reduce((sum, sale) => sum + sale.quantity, 0)}`, color: secondaryColor }
      ]
      
      addStats(stats)

      // Tableau des ventes
      const tableColumns = ['Date', 'Produit', 'Client', 'Qty', 'Prix unitaire', 'Total']
      const tableData = sales.map(sale => {
        const product = products.find(p => p.id === sale.product_id)
        return [
          new Date(sale.created_at).toLocaleDateString('fr-FR'),
          product?.name || 'Produit supprimé',
          sale.customer_name || 'Client anonyme',
          sale.quantity.toString(),
          `${formatAmountForPDF(Number(sale.unit_price))} CFA`,
          `${formatAmountForPDF(Number(sale.total_amount))} CFA`
        ]
      })

      autoTable(doc, {
        startY: currentY,
        head: [tableColumns],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: primaryColor,
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          cellPadding: 3
        },
        alternateRowStyles: { 
          fillColor: [248, 250, 252] 
        },
        columnStyles: {
          3: { halign: 'center' },
          4: { halign: 'right' },
          5: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 }
      })

    } else if (data === 'products') {
      addHeader('INVENTAIRE COMPLET DES PRODUITS')
      
      const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
      const stats = [
        { label: 'Nombre total de produits', value: `${metrics.totalProducts}`, color: primaryColor },
        { label: 'Valeur totale du stock', value: `${totalStockValue.toLocaleString()} CFA`, color: successColor },
        { label: 'Produits en stock bas', value: `${metrics.lowStockProducts}`, color: warningColor },
        { label: 'Produits épuisés', value: `${metrics.outOfStockProducts}`, color: errorColor }
      ]
      
      addStats(stats)

      const tableColumns = ['Produit', 'Catégorie', 'Prix', 'Stock', 'Min.', 'Valeur', 'Statut']
      const tableData = products.map(product => {
        const stockValue = product.price * product.quantity
        let status = 'Normal'
        
        if (product.quantity === 0) {
          status = 'Épuisé'
        } else if (product.quantity <= product.min_quantity) {
          status = 'Stock bas'
        }

        return [
          product.name,
          product.category || 'Non définie',
          `${Number(product.price).toLocaleString()} CFA`,
          product.quantity.toString(),
          product.min_quantity.toString(),
          `${formatAmountForPDF(stockValue)} CFA`,
          status
        ]
      })

      autoTable(doc, {
        startY: currentY,
        head: [tableColumns],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: primaryColor,
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          cellPadding: 3
        },
        alternateRowStyles: { 
          fillColor: [248, 250, 252] 
        },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'right' },
          6: { halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 },
        didParseCell: function(data) {
          if (data.column.index === 6) { // Colonne Statut
            const status = data.cell.raw as string
            if (status === 'Épuisé') {
              data.cell.styles.textColor = errorColor
              data.cell.styles.fontStyle = 'bold'
            } else if (status === 'Stock bas') {
              data.cell.styles.textColor = warningColor
              data.cell.styles.fontStyle = 'bold'
            } else {
              data.cell.styles.textColor = successColor
            }
          }
        }
      })

    } else if (data === 'payments') {
      addHeader('RAPPORT DES PAIEMENTS')
      
      const stats = [
        { label: 'Nombre total de paiements', value: `${payments.length}`, color: primaryColor },
        { label: 'Montant total encaissé', value: `${metrics.totalPaid.toLocaleString()} CFA`, color: successColor },
        { label: 'Montant en attente', value: `${metrics.totalPending.toLocaleString()} CFA`, color: warningColor },
        { label: 'Taux de recouvrement', value: `${metrics.paymentRate}%`, color: primaryColor }
      ]
      
      addStats(stats)

      const tableColumns = ['Date', 'Client', 'Téléphone', 'Montant', 'Méthode', 'Statut']
      const tableData = payments.map(payment => {
        const fullName = `${payment.customer_first_name || ''} ${payment.customer_last_name || ''}`.trim() || 'N/A'
        return [
          new Date(payment.created_at).toLocaleDateString('fr-FR'),
          fullName,
          payment.customer_phone || 'N/A',
          `${formatAmountForPDF(Number(payment.total_amount))} CFA`,
          payment.payment_method,
          payment.status === 'completed' ? 'Terminé' : 
          payment.status === 'pending' ? 'En attente' : 
          payment.status === 'partial' ? 'Partiel' : 'En retard'
        ]
      })

      autoTable(doc, {
        startY: currentY,
        head: [tableColumns],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: primaryColor,
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          cellPadding: 3
        },
        alternateRowStyles: { 
          fillColor: [248, 250, 252] 
        },
        columnStyles: {
          3: { halign: 'right', fontStyle: 'bold' },
          4: { halign: 'center' },
          5: { halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 },
        didParseCell: function(data) {
          if (data.column.index === 5) { // Colonne Statut
            const status = data.cell.raw as string
            if (status === 'Terminé') {
              data.cell.styles.textColor = successColor
            } else if (status === 'En attente' || status === 'Partiel') {
              data.cell.styles.textColor = warningColor
            } else {
              data.cell.styles.textColor = errorColor
            }
          }
        }
      })
    }

    // Ajouter un pied de page
    const finalY = (doc as any).lastAutoTable?.finalY || currentY
    if (finalY < pageHeight - 30) {
      doc.setFontSize(8)
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.setFont('helvetica', 'italic')
      doc.text(`Rapport généré automatiquement par votre système de gestion`, pageWidth / 2, pageHeight - 20, { align: 'center' })
      doc.text(`Page 1`, pageWidth / 2, pageHeight - 10, { align: 'center' })
    }

    // Télécharger le PDF
    const filename = `rapport_${data}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
    
    toast.success(`Rapport PDF ${filename} téléchargé avec succès`)
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

  const formatAmountForPDF = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true
    }).format(amount).replace(/\s/g, ' '); // Remplace les espaces insécables par des espaces normaux
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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-secondary bg-clip-text text-transparent truncate">
          {isMobile ? "Rapports" : "Rapports et analyses"}
        </h1>
        <p className="text-sm text-muted-foreground truncate">
          {isMobile ? "Vos rapports d'activité" : "Générez et consultez vos rapports d'activité"}
        </p>
      </div>

      {/* Quick Export Actions */}
      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/20 dark:to-cyan-900/10 border-2 border-cyan-200 dark:border-cyan-800/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-md shrink-0">
              <Download className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="truncate">Exports rapides</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-start gap-2 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800/30 hover:shadow-lg transition-all min-w-0"
              onClick={() => handleExport('csv', 'sales')}
            >
              <div className="flex items-center gap-2 w-full min-w-0">
                <div className="p-1 rounded bg-gradient-to-br from-blue-500 to-blue-600 shrink-0">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-medium text-sm sm:text-base truncate">{isMobile ? "Ventes" : "Ventes aujourd'hui"}</span>
                <Badge variant="outline" className="ml-auto text-xs shrink-0">CSV</Badge>
              </div>
              {!isMobile && (
                <p className="text-xs sm:text-sm text-muted-foreground text-left">
                  Export CSV des ventes d'aujourd'hui
                </p>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-start gap-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800/30 hover:shadow-lg transition-all min-w-0"
              onClick={() => handleExport('excel', 'products')}
            >
              <div className="flex items-center gap-2 w-full min-w-0">
                <div className="p-1 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 shrink-0">
                  <PieChart className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-medium text-sm sm:text-base truncate">{isMobile ? "Stock" : "Stock complet"}</span>
                <Badge variant="outline" className="ml-auto text-xs shrink-0">Excel</Badge>
              </div>
              {!isMobile && (
                <p className="text-xs sm:text-sm text-muted-foreground text-left">
                  Export Excel de l'inventaire complet
                </p>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-start gap-2 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-2 border-orange-200 dark:border-orange-800/30 hover:shadow-lg transition-all min-w-0 sm:col-span-2 lg:col-span-1"
              onClick={() => handleExport('pdf', 'payments')}
            >
              <div className="flex items-center gap-2 w-full min-w-0">
                <div className="p-1 rounded bg-gradient-to-br from-orange-500 to-orange-600 shrink-0">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-medium text-sm sm:text-base truncate">{isMobile ? "Paiements" : "Rapport paiements"}</span>
                <Badge variant="outline" className="ml-auto text-xs shrink-0">PDF</Badge>
              </div>
              {!isMobile && (
                <p className="text-xs sm:text-sm text-muted-foreground text-left">
                  Export PDF des paiements
                </p>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Report */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800/30 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Rapport des ventes</CardTitle>
                  <p className="text-sm text-muted-foreground">Analyse détaillée des ventes par période</p>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white">Prêt</Badge>
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

            <div className="bg-white/50 dark:bg-card/50 rounded-lg p-3 space-y-2 border border-blue-200 dark:border-blue-800/30">
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
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">+0%</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg min-w-0"
                onClick={() => {
                  setSelectedReportType('sales');
                  setShowReportDialog(true);
                }}
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                <span className="hidden sm:inline truncate">Voir le rapport</span>
                <span className="sm:hidden truncate">Voir</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="hover:bg-emerald-50 dark:hover:bg-emerald-950/20 shrink-0"
                onClick={() => handleExport('excel', 'sales')}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0"
                onClick={() => handleExport('pdf', 'sales')}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Report */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800/30 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">État des stocks</CardTitle>
                  <p className="text-sm text-muted-foreground">Inventaire et mouvements de stock</p>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white">Prêt</Badge>
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

            <div className="bg-white/50 dark:bg-card/50 rounded-lg p-3 space-y-2 border border-emerald-200 dark:border-emerald-800/30">
              <h4 className="text-sm font-medium text-foreground">Aperçu des données</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Produits</p>
                  <p className="font-medium">{metrics.totalProducts}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stock bas</p>
                  <p className="font-medium text-orange-600 dark:text-orange-400">{metrics.lowStockProducts}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Épuisé</p>
                  <p className="font-medium text-red-600 dark:text-red-400">{metrics.outOfStockProducts}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-lg min-w-0"
                onClick={() => {
                  setSelectedReportType('inventory');
                  setShowReportDialog(true);
                }}
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                <span className="hidden sm:inline truncate">Voir le rapport</span>
                <span className="sm:hidden truncate">Voir</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="hover:bg-emerald-50 dark:hover:bg-emerald-950/20 shrink-0"
                onClick={() => handleExport('excel', 'products')}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0"
                onClick={() => handleExport('pdf', 'products')}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Report */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-2 border-orange-200 dark:border-orange-800/30 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Suivi des paiements</CardTitle>
                  <p className="text-sm text-muted-foreground">Paiements reçus et en attente</p>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white">Prêt</Badge>
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

            <div className="bg-white/50 dark:bg-card/50 rounded-lg p-3 space-y-2 border border-orange-200 dark:border-orange-800/30">
              <h4 className="text-sm font-medium text-foreground">Aperçu des données</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Payé</p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">{metrics.paymentRate}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">En attente</p>
                  <p className="font-medium text-orange-600 dark:text-orange-400">{metrics.totalPending.toLocaleString()} CFA</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reçu</p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">{metrics.totalPaid.toLocaleString()} CFA</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-lg min-w-0"
                onClick={() => {
                  setSelectedReportType('payments');
                  setShowReportDialog(true);
                }}
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                <span className="hidden sm:inline truncate">Voir le rapport</span>
                <span className="sm:hidden truncate">Voir</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="hover:bg-emerald-50 dark:hover:bg-emerald-950/20 shrink-0"
                onClick={() => handleExport('excel', 'payments')}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0"
                onClick={() => handleExport('pdf', 'payments')}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                <span className="hidden sm:inline">PDF</span>
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

      {/* Dialogs */}
      <ReportDialog
        reportType={selectedReportType}
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
      />
    </div>
  )
}