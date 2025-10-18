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

const formatAmount = (amount: number): string => {
  const formatted = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true
  }).replace(/\s/g, '.').replace(',', '.');
  
  return `${formatted} FCFA`;
};

export const exportToPDF = async (data: ExportData, filename: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Couleurs professionnelles
  const primaryColor: [number, number, number] = [41, 98, 255];
  const accentColor: [number, number, number] = [16, 185, 129];
  const textColor: [number, number, number] = [30, 30, 30];
  const lightGray: [number, number, number] = [248, 250, 252];
  
  // En-tête avec style professionnel
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('RAPPORT DE PERFORMANCE', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const periodText = `Période: ${format(data.dateRange.from, 'dd/MM/yyyy', { locale: fr })} - ${format(data.dateRange.to, 'dd/MM/yyyy', { locale: fr })}`;
  doc.text(periodText, pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(9);
  doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, pageWidth / 2, 38, { align: 'center' });
  
  // Métriques principales avec design moderne
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text('Indicateurs Clés', 20, 60);
  
  const metricsData = [
    ['Indicateur', 'Valeur'],
    ['Nombre de Ventes', data.metrics.totalSales.toString() + ' ventes'],
    ['Chiffre d\'Affaires', formatAmount(data.metrics.totalRevenue)],
    ['Marge Brute', formatAmount(data.metrics.grossMargin)],
    ['Paiements Reçus', formatAmount(data.metrics.totalPayments)]
  ];
  
  autoTable(doc, {
    head: [metricsData[0]],
    body: metricsData.slice(1),
    startY: 68,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 10,
      textColor: textColor
    },
    alternateRowStyles: { 
      fillColor: lightGray
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', cellWidth: 'auto' }
    },
    margin: { left: 20, right: 20 }
  });
  
  // Tableau des ventes avec style amélioré
  if (data.sales.length > 0) {
    doc.addPage();
    
    // En-tête de section
    doc.setFillColor(...accentColor);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DÉTAIL DES VENTES', pageWidth / 2, 22, { align: 'center' });
    
    const salesData = data.sales.map(sale => [
      format(new Date(sale.sale_date), 'dd/MM/yyyy', { locale: fr }),
      sale.customer_name || 'Client non renseigné',
      sale.quantity.toString() + ' unités',
      formatAmount(sale.total_amount)
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Client', 'Quantité', 'Montant Total']],
      body: salesData,
      startY: 45,
      theme: 'striped',
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor
      },
      alternateRowStyles: { 
        fillColor: lightGray
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 30 },
        1: { halign: 'left', cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 50 }
      },
      margin: { left: 20, right: 20 }
    });
  }
  
  // Pied de page professionnel
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Page ${i} sur ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
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