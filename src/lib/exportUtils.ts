import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExportData {
  metrics: {
    totalSales: number;
    totalRevenue: number;
    totalPayments: number;
    grossMargin: number;
  };
  sales: any[];
  products: any[];
  payments: any[];
  period: string;
  dateRange: { from: Date; to: Date };
}

export const exportToPDF = async (data: ExportData, filename: string) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Rapport de Performance', 20, 20);
  
  // Période
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const periodText = `Période: ${format(data.dateRange.from, 'dd/MM/yyyy', { locale: fr })} - ${format(data.dateRange.to, 'dd/MM/yyyy', { locale: fr })}`;
  doc.text(periodText, 20, 30);
  
  // Date de génération
  doc.text(`Généré le: ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 20, 40);
  
  // Métriques principales
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Métriques Principales', 20, 60);
  
  const metricsData = [
    ['Indicateur', 'Valeur'],
    ['Ventes Totales', data.metrics.totalSales.toString()],
    ['Chiffre d\'Affaires', new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(data.metrics.totalRevenue)],
    ['Marge Brute', new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(data.metrics.grossMargin)],
    ['Paiements Reçus', new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(data.metrics.totalPayments)]
  ];
  
  autoTable(doc, {
    head: [metricsData[0]],
    body: metricsData.slice(1),
    startY: 70,
    headStyles: { fillColor: [66, 139, 202] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  // Tableau des ventes
  if (data.sales.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Détail des Ventes', 20, 20);
    
    const salesData = data.sales.map(sale => [
      format(new Date(sale.sale_date), 'dd/MM/yyyy', { locale: fr }),
      sale.customer_name || 'N/A',
      sale.quantity.toString(),
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(sale.total_amount)
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Client', 'Quantité', 'Montant']],
      body: salesData,
      startY: 30,
      headStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
  }
  
  // Sauvegarder le PDF
  doc.save(filename);
};

export const exportToExcel = async (data: ExportData, filename: string) => {
  const workbook = XLSX.utils.book_new();
  
  // Feuille Métriques
  const metricsWS = XLSX.utils.aoa_to_sheet([
    ['Rapport de Performance'],
    [''],
    [`Période: ${format(data.dateRange.from, 'dd/MM/yyyy', { locale: fr })} - ${format(data.dateRange.to, 'dd/MM/yyyy', { locale: fr })}`],
    [`Généré le: ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`],
    [''],
    ['Métriques Principales'],
    ['Indicateur', 'Valeur'],
    ['Ventes Totales', data.metrics.totalSales],
    ['Chiffre d\'Affaires', data.metrics.totalRevenue],
    ['Marge Brute', data.metrics.grossMargin],
    ['Paiements Reçus', data.metrics.totalPayments]
  ]);
  
  XLSX.utils.book_append_sheet(workbook, metricsWS, 'Métriques');
  
  // Feuille Ventes
  if (data.sales.length > 0) {
    const salesData = [
      ['Date', 'Client', 'Produit ID', 'Quantité', 'Prix Unitaire', 'Montant Total'],
      ...data.sales.map(sale => [
        format(new Date(sale.sale_date), 'dd/MM/yyyy', { locale: fr }),
        sale.customer_name || 'N/A',
        sale.product_id,
        sale.quantity,
        sale.unit_price,
        sale.total_amount
      ])
    ];
    
    const salesWS = XLSX.utils.aoa_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesWS, 'Ventes');
  }
  
  // Feuille Paiements
  if (data.payments.length > 0) {
    const paymentsData = [
      ['Date', 'Client', 'Montant', 'Méthode', 'Statut'],
      ...data.payments.map(payment => [
        format(new Date(payment.payment_date), 'dd/MM/yyyy', { locale: fr }),
        payment.customer_name || `${payment.customer_first_name || ''} ${payment.customer_last_name || ''}`.trim() || 'N/A',
        payment.paid_amount,
        payment.payment_method,
        payment.status
      ])
    ];
    
    const paymentsWS = XLSX.utils.aoa_to_sheet(paymentsData);
    XLSX.utils.book_append_sheet(workbook, paymentsWS, 'Paiements');
  }
  
  // Feuille Produits
  if (data.products.length > 0) {
    const productsData = [
      ['Nom', 'Prix', 'Stock', 'Stock Minimum', 'Catégorie'],
      ...data.products.map(product => [
        product.name,
        product.price,
        product.quantity,
        product.min_quantity,
        product.category || 'N/A'
      ])
    ];
    
    const productsWS = XLSX.utils.aoa_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsWS, 'Produits');
  }
  
  // Sauvegarder le fichier Excel
  XLSX.writeFile(workbook, filename);
};