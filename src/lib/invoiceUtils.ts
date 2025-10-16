import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Invoice, InvoiceItem } from '@/hooks/useInvoices';

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

  // Couleurs
  const primaryColor: [number, number, number] = [66, 139, 202];
  const textColor: [number, number, number] = [40, 40, 40];

  // En-tête - Type de document
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  const docTitle = invoice.document_type === 'facture' ? 'FACTURE' : 'DEVIS';
  doc.text(docTitle, 20, 25);

  // Numéro de document
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text(`N° ${invoice.document_number}`, 20, 35);

  // Date
  doc.setFontSize(10);
  doc.text(`Date: ${format(new Date(invoice.issue_date), 'dd/MM/yyyy', { locale: fr })}`, 20, 42);
  if (invoice.due_date) {
    doc.text(`Échéance: ${format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr })}`, 20, 48);
  }

  // Statut
  const statusLabels = {
    brouillon: 'Brouillon',
    envoye: 'Envoyé',
    paye: 'Payé',
    annule: 'Annulé',
    accepte: 'Accepté',
    refuse: 'Refusé',
  };
  doc.text(`Statut: ${statusLabels[invoice.status]}`, 20, invoice.due_date ? 54 : 48);

  // Informations entreprise (à droite)
  let yPos = 25;
  if (invoice.company_name) {
    // Logo de l'entreprise
    if (invoice.company_logo_url) {
      try {
        const img = new Image();
        img.src = invoice.company_logo_url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        doc.addImage(img, 'PNG', pageWidth - 40, yPos, 20, 20);
        yPos += 25;
      } catch (error) {
        console.error('Erreur lors du chargement du logo:', error);
      }
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.company_name, pageWidth - 20, yPos, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    yPos += 6;

    if (invoice.company_address) {
      doc.text(invoice.company_address, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }
    if (invoice.company_postal_code || invoice.company_city) {
      doc.text(`${invoice.company_postal_code || ''} ${invoice.company_city || ''}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }
    if (invoice.company_phone) {
      doc.text(`Tél: ${invoice.company_phone}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }
    if (invoice.company_email) {
      doc.text(invoice.company_email, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }
    if (invoice.company_siret) {
      doc.text(`SIRET: ${invoice.company_siret}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }
    if (invoice.company_tva) {
      doc.text(`TVA: ${invoice.company_tva}`, pageWidth - 20, yPos, { align: 'right' });
    }
  }

  // Client (encadré)
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 70, 80, 40, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 25, 78);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  let clientY = 85;
  doc.text(invoice.client_name, 25, clientY);
  clientY += 5;

  if (invoice.client_address) {
    doc.text(invoice.client_address, 25, clientY);
    clientY += 5;
  }
  if (invoice.client_postal_code || invoice.client_city) {
    doc.text(`${invoice.client_postal_code || ''} ${invoice.client_city || ''}`, 25, clientY);
    clientY += 5;
  }
  if (invoice.client_email) {
    doc.text(invoice.client_email, 25, clientY);
    clientY += 5;
  }
  if (invoice.client_phone) {
    doc.text(invoice.client_phone, 25, clientY);
  }

  // Tableau des articles
  const tableData = items.map(item => [
    item.description,
    item.quantity.toString(),
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.unit_price),
    `${item.discount_rate}%`,
    `${item.tax_rate}%`,
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.total_amount),
  ]);

  autoTable(doc, {
    head: [['Description', 'Qté', 'Prix Unit.', 'Remise', 'TVA', 'Total']],
    body: tableData,
    startY: 120,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    styles: {
      fontSize: 9,
    },
  });

  // Totaux
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  const totalsX = pageWidth - 70;

  doc.setFontSize(10);
  doc.text('Sous-total HT:', totalsX, finalY + 15);
  doc.text(
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.subtotal),
    pageWidth - 20,
    finalY + 15,
    { align: 'right' }
  );

  if (invoice.discount_amount > 0) {
    doc.text('Remise:', totalsX, finalY + 22);
    doc.text(
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.discount_amount),
      pageWidth - 20,
      finalY + 22,
      { align: 'right' }
    );
  }

  doc.text('TVA:', totalsX, finalY + (invoice.discount_amount > 0 ? 29 : 22));
  doc.text(
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.tax_amount),
    pageWidth - 20,
    finalY + (invoice.discount_amount > 0 ? 29 : 22),
    { align: 'right' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const totalY = finalY + (invoice.discount_amount > 0 ? 36 : 29);
  doc.text('TOTAL TTC:', totalsX, totalY);
  doc.text(
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(invoice.total_amount),
    pageWidth - 20,
    totalY,
    { align: 'right' }
  );

  // Notes
  if (invoice.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Notes:', 20, totalY + 15);
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(splitNotes, 20, totalY + 21);
  }

  // Conditions
  if (invoice.terms) {
    const termsY = totalY + (invoice.notes ? 35 : 15);
    doc.setFontSize(9);
    doc.text('Conditions:', 20, termsY);
    const splitTerms = doc.splitTextToSize(invoice.terms, pageWidth - 40);
    doc.text(splitTerms, 20, termsY + 6);
  }

  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Document généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
    pageWidth / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );

  // Sauvegarder
  const filename = `${invoice.document_type}-${invoice.document_number}.pdf`;
  doc.save(filename);
};
