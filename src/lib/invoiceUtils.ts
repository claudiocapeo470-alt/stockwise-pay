import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Invoice, InvoiceItem } from '@/hooks/useInvoices';

const formatAmount = (amount: number): string => {
  const formatted = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true
  }).replace(/\s/g, '.').replace(',', '.');
  
  return `${formatted} FCFA`;
};

export const calculateItemTotals = (item: Partial<InvoiceItem>): InvoiceItem => {
  const quantity = item.quantity || 0;
  const unitPrice = item.unit_price || 0;
  const taxRate = item.tax_rate ?? 0;
  const discountRate = item.discount_rate || 0;

  const subtotal = quantity * unitPrice;
  const discountAmount = subtotal * (discountRate / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = subtotalAfterDiscount * (taxRate / 100);
  const totalAmount = subtotalAfterDiscount + taxAmount;

  return {
    description: item.description || '',
    quantity,
    unit_price: unitPrice,
    tax_rate: taxRate,
    discount_rate: discountRate,
    subtotal: subtotalAfterDiscount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    position: item.position || 0,
  };
};

export const calculateInvoiceTotals = (items: InvoiceItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = items.reduce((sum, item) => sum + item.tax_amount, 0);
  const discountAmount = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unit_price;
    return sum + (itemSubtotal * (item.discount_rate / 100));
  }, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.total_amount, 0);

  return {
    subtotal,
    tax_amount: taxAmount,
    discount_amount: discountAmount,
    total_amount: totalAmount,
  };
};

export const exportInvoiceToPDF = async (
  invoice: Invoice,
  items: InvoiceItem[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Couleurs professionnelles
  const primaryColor: [number, number, number] = [41, 98, 255];
  const accentColor: [number, number, number] = [16, 185, 129];
  const textColor: [number, number, number] = [30, 30, 30];
  const lightGray: [number, number, number] = [248, 250, 252];
  const borderColor: [number, number, number] = [226, 232, 240];

  const docTitle = invoice.document_type === 'facture' ? 'FACTURE' : 'DEVIS';
  
  // En-tête moderne avec bande de couleur
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Titre du document
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(docTitle, 20, 25);

  // Numéro de document
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoice.document_number}`, 20, 38);

  // Statut avec badge
  const statusLabels = {
    brouillon: 'BROUILLON',
    envoye: 'ENVOYÉ',
    paye: 'PAYÉ',
    annule: 'ANNULÉ',
    accepte: 'ACCEPTÉ',
    refuse: 'REFUSÉ',
  };
  
  const statusColors: Record<string, [number, number, number]> = {
    brouillon: [156, 163, 175],
    envoye: [59, 130, 246],
    paye: [16, 185, 129],
    annule: [239, 68, 68],
    accepte: [16, 185, 129],
    refuse: [239, 68, 68],
  };
  
  const statusColor = statusColors[invoice.status] || [156, 163, 175];
  doc.setFillColor(...statusColor);
  doc.roundedRect(pageWidth - 60, 20, 40, 12, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabels[invoice.status], pageWidth - 40, 27.5, { align: 'center' });

  // Section dates dans un encadré élégant
  doc.setDrawColor(...borderColor);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 60, 85, 28, 2, 2, 'FD');
  
  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE D\'ÉMISSION', 25, 68);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(format(new Date(invoice.issue_date), 'dd/MM/yyyy', { locale: fr }), 25, 75);
  
  if (invoice.due_date) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DATE D\'ÉCHÉANCE', 25, 82);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr }), 25, 89);
  }

  // Informations entreprise dans un encadré professionnel
  let yPos = 60;
  if (invoice.company_name) {
    doc.setDrawColor(...borderColor);
    doc.setFillColor(...lightGray);
    doc.roundedRect(pageWidth - 95, yPos, 75, 50, 2, 2, 'FD');
    
    yPos += 8;
    
    // Logo de l'entreprise
    if (invoice.company_logo_url) {
      try {
        const img = new Image();
        img.src = invoice.company_logo_url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        doc.addImage(img, 'PNG', pageWidth - 90, yPos - 3, 18, 18);
        yPos += 20;
      } catch (error) {
        console.error('Erreur lors du chargement du logo:', error);
      }
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    const companyLines = doc.splitTextToSize(invoice.company_name, 65);
    doc.text(companyLines, pageWidth - 90, yPos);
    yPos += companyLines.length * 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textColor);

    if (invoice.company_address) {
      const addressLines = doc.splitTextToSize(invoice.company_address, 65);
      doc.text(addressLines, pageWidth - 90, yPos);
      yPos += addressLines.length * 4;
    }
    if (invoice.company_postal_code || invoice.company_city) {
      doc.text(`${invoice.company_postal_code || ''} ${invoice.company_city || ''}`, pageWidth - 90, yPos);
      yPos += 4;
    }
    if (invoice.company_phone) {
      doc.text(`Tél: ${invoice.company_phone}`, pageWidth - 90, yPos);
      yPos += 4;
    }
    if (invoice.company_email) {
      doc.text(invoice.company_email, pageWidth - 90, yPos);
      yPos += 4;
    }
    if (invoice.company_siret) {
      doc.text(`SIRET: ${invoice.company_siret}`, pageWidth - 90, yPos);
      yPos += 4;
    }
    if (invoice.company_tva) {
      doc.text(`TVA: ${invoice.company_tva}`, pageWidth - 90, yPos);
    }
  }

  // Client dans un encadré professionnel
  doc.setDrawColor(...borderColor);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 95, 85, 45, 2, 2, 'FD');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text('FACTURÉ À', 25, 103);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  let clientY = 110;
  const clientNameLines = doc.splitTextToSize(invoice.client_name, 75);
  doc.text(clientNameLines, 25, clientY);
  clientY += clientNameLines.length * 5 + 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  if (invoice.client_address) {
    const addressLines = doc.splitTextToSize(invoice.client_address, 75);
    doc.text(addressLines, 25, clientY);
    clientY += addressLines.length * 4;
  }
  if (invoice.client_postal_code || invoice.client_city) {
    doc.text(`${invoice.client_postal_code || ''} ${invoice.client_city || ''}`, 25, clientY);
    clientY += 4;
  }
  if (invoice.client_email) {
    doc.text(invoice.client_email, 25, clientY);
    clientY += 4;
  }
  if (invoice.client_phone) {
    doc.text(`Tél: ${invoice.client_phone}`, 25, clientY);
  }

  // Titre de section pour les articles
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text('DÉTAIL DES ARTICLES', 20, 150);

  // Tableau des articles avec design professionnel
  const tableData = items.map(item => [
    item.description,
    item.quantity.toString(),
    formatAmount(item.unit_price),
    `${item.discount_rate}%`,
    `${item.tax_rate}%`,
    formatAmount(item.total_amount),
  ]);

  autoTable(doc, {
    head: [['Description', 'Qté', 'Prix Unitaire', 'Remise', 'TVA', 'Total HT']],
    body: tableData,
    startY: 158,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textColor,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'right', cellWidth: 40 }
    },
    margin: { left: 20, right: 20 }
  });

  // Section totaux dans un encadré élégant
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  const totalsX = pageWidth - 85;
  const totalsWidth = 65;
  
  // Encadré pour les totaux
  doc.setDrawColor(...borderColor);
  doc.setFillColor(...lightGray);
  const totalsHeight = invoice.discount_amount > 0 ? 45 : 38;
  doc.roundedRect(totalsX - 5, finalY + 10, totalsWidth, totalsHeight, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  let currentY = finalY + 18;
  
  doc.text('Sous-total HT:', totalsX, currentY);
  doc.text(
    formatAmount(invoice.subtotal),
    pageWidth - 25,
    currentY,
    { align: 'right' }
  );
  currentY += 7;

  if (invoice.discount_amount > 0) {
    doc.text('Remise:', totalsX, currentY);
    doc.text(
      '- ' + formatAmount(invoice.discount_amount),
      pageWidth - 25,
      currentY,
      { align: 'right' }
    );
    currentY += 7;
  }

  doc.text('TVA:', totalsX, currentY);
  doc.text(
    formatAmount(invoice.tax_amount),
    pageWidth - 25,
    currentY,
    { align: 'right' }
  );
  currentY += 10;

  // Total en surbrillance
  doc.setFillColor(...accentColor);
  doc.roundedRect(totalsX - 5, currentY - 5, totalsWidth, 12, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL TTC:', totalsX, currentY + 2);
  doc.text(
    formatAmount(invoice.total_amount),
    pageWidth - 25,
    currentY + 2,
    { align: 'right' }
  );

  // Notes dans un encadré si présentes
  const totalY = finalY + (invoice.discount_amount > 0 ? 56 : 49);
  let currentBottomY = totalY + 10;
  
  if (invoice.notes) {
    doc.setDrawColor(...borderColor);
    doc.setFillColor(255, 255, 255);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text('NOTES', 20, currentBottomY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(splitNotes, 20, currentBottomY + 6);
    currentBottomY += 6 + (splitNotes.length * 4) + 8;
  }

  // Conditions dans un encadré si présentes
  if (invoice.terms) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text('CONDITIONS DE PAIEMENT', 20, currentBottomY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    const splitTerms = doc.splitTextToSize(invoice.terms, pageWidth - 40);
    doc.text(splitTerms, 20, currentBottomY + 6);
  }

  // Pied de page élégant
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(20, doc.internal.pageSize.height - 20, pageWidth - 20, doc.internal.pageSize.height - 20);
  
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Document généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
    pageWidth / 2,
    doc.internal.pageSize.height - 12,
    { align: 'center' }
  );

  // Sauvegarder
  const filename = `${invoice.document_type}-${invoice.document_number}.pdf`;
  doc.save(filename);
};
