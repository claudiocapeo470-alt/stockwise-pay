import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Invoice, InvoiceItem } from '@/hooks/useInvoices';

const formatAmount = (amount: number, currencySymbol: string = 'FCFA'): string => {
  const formatted = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true
  }).format(amount);

  return `${formatted} ${currencySymbol}`;
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

/** Charge une image distante en dataURL (évite les images manquantes dans le PDF). */
const loadImage = (url: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    } catch {
      resolve(null);
    }
  });

export const exportInvoiceToPDF = async (
  invoice: Invoice,
  items: InvoiceItem[],
  currencySymbol: string = 'FCFA'
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const M = 16; // marge

  // Palette Stocknix
  const navy: [number, number, number] = [10, 26, 59];
  const blue: [number, number, number] = [37, 99, 235];
  const ink: [number, number, number] = [23, 32, 48];
  const grayText: [number, number, number] = [110, 122, 140];
  const line: [number, number, number] = [226, 232, 240];
  const soft: [number, number, number] = [246, 248, 251];

  const isFacture = invoice.document_type === 'facture';
  const docTitle = isFacture ? 'FACTURE' : 'DEVIS';

  const [companyLogo, clientLogo] = await Promise.all([
    invoice.company_logo_url ? loadImage(invoice.company_logo_url) : Promise.resolve(null),
    invoice.client_logo_url ? loadImage(invoice.client_logo_url) : Promise.resolve(null),
  ]);

  /* ---------------- EN-TÊTE ---------------- */
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 46, 'F');
  doc.setFillColor(...blue);
  doc.rect(0, 46, pageWidth, 1.6, 'F');

  let headerX = M;
  if (companyLogo) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(M, 12, 22, 22, 3, 3, 'F');
    try {
      doc.addImage(companyLogo, 'PNG', M + 2, 14, 18, 18);
    } catch { /* logo illisible : ignoré */ }
    headerX = M + 28;
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(invoice.company_name || 'Votre entreprise', headerX, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 212, 235);
  const companyMeta = [
    invoice.company_address,
    [invoice.company_postal_code, invoice.company_city].filter(Boolean).join(' '),
    [invoice.company_phone && `Tél: ${invoice.company_phone}`, invoice.company_email].filter(Boolean).join('  ·  '),
    [invoice.company_siret && `SIRET: ${invoice.company_siret}`, invoice.company_tva && `TVA: ${invoice.company_tva}`].filter(Boolean).join('  ·  '),
  ].filter(Boolean) as string[];
  companyMeta.slice(0, 4).forEach((l, i) => doc.text(l, headerX, 26 + i * 4.4));

  // Titre du document à droite
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text(docTitle, pageWidth - M, 22, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 212, 235);
  doc.text(`N° ${invoice.document_number}`, pageWidth - M, 30, { align: 'right' });

  const statusLabels: Record<string, string> = {
    brouillon: 'BROUILLON', envoye: 'ENVOYÉ', paye: 'PAYÉ',
    annule: 'ANNULÉ', accepte: 'ACCEPTÉ', refuse: 'REFUSÉ',
  };
  const statusColors: Record<string, [number, number, number]> = {
    brouillon: [148, 163, 184], envoye: [59, 130, 246], paye: [5, 150, 105],
    annule: [220, 38, 38], accepte: [5, 150, 105], refuse: [220, 38, 38],
  };
  const label = statusLabels[invoice.status] || '';
  const sColor = statusColors[invoice.status] || [148, 163, 184];
  const badgeW = doc.getTextWidth(label) * 0.36 + 14;
  doc.setFillColor(...sColor);
  doc.roundedRect(pageWidth - M - badgeW, 34, badgeW, 7, 3.5, 3.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(label, pageWidth - M - badgeW / 2, 38.7, { align: 'center' });

  /* ---------------- CLIENT + DATES ---------------- */
  const blockY = 58;
  const colW = (pageWidth - M * 2 - 8) / 2;

  // Carte client
  doc.setFillColor(...soft);
  doc.setDrawColor(...line);
  doc.roundedRect(M, blockY, colW, 42, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...blue);
  doc.text(isFacture ? 'FACTURÉ À' : 'DESTINATAIRE', M + 6, blockY + 8);

  let cx = M + 6;
  let cy = blockY + 16;
  if (clientLogo) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...line);
    doc.roundedRect(M + 6, blockY + 11, 16, 16, 2, 2, 'FD');
    try {
      doc.addImage(clientLogo, 'PNG', M + 7.5, blockY + 12.5, 13, 13);
    } catch { /* ignoré */ }
    cx = M + 26;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  const nameLines = doc.splitTextToSize(invoice.client_name, colW - (cx - M) - 8);
  doc.text(nameLines, cx, cy);
  cy += nameLines.length * 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayText);
  const clientMeta = [
    invoice.client_address,
    [invoice.client_postal_code, invoice.client_city].filter(Boolean).join(' '),
    invoice.client_email,
    invoice.client_phone && `Tél: ${invoice.client_phone}`,
  ].filter(Boolean) as string[];
  clientMeta.slice(0, 4).forEach((l) => {
    const lines = doc.splitTextToSize(l, colW - (cx - M) - 8);
    doc.text(lines, cx, cy);
    cy += lines.length * 4.2;
  });

  // Carte dates
  const dx = M + colW + 8;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...line);
  doc.roundedRect(dx, blockY, colW, 42, 3, 3, 'FD');

  const dateRows: [string, string][] = [
    ["DATE D'ÉMISSION", format(new Date(invoice.issue_date), 'dd MMMM yyyy', { locale: fr })],
  ];
  if (invoice.due_date) {
    dateRows.push([isFacture ? "DATE D'ÉCHÉANCE" : "VALABLE JUSQU'AU", format(new Date(invoice.due_date), 'dd MMMM yyyy', { locale: fr })]);
  }
  dateRows.push(['MONTANT TOTAL', formatAmount(invoice.total_amount, currencySymbol)]);

  let dy = blockY + 9;
  dateRows.forEach(([k, v], i) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...grayText);
    doc.text(k, dx + 6, dy);
    doc.setFont('helvetica', i === dateRows.length - 1 ? 'bold' : 'normal');
    doc.setFontSize(i === dateRows.length - 1 ? 11 : 9.5);
    doc.setTextColor(...(i === dateRows.length - 1 ? blue : ink));
    doc.text(v, dx + colW - 6, dy, { align: 'right' });
    dy += 12;
    if (i < dateRows.length - 1) {
      doc.setDrawColor(...line);
      doc.line(dx + 6, dy - 7.5, dx + colW - 6, dy - 7.5);
    }
  });

  /* ---------------- TABLEAU ---------------- */
  const tableData = items.map(item => [
    item.description,
    item.quantity.toString(),
    formatAmount(item.unit_price, currencySymbol),
    item.discount_rate ? `${item.discount_rate}%` : '—',
    item.tax_rate ? `${item.tax_rate}%` : '—',
    formatAmount(item.total_amount, currencySymbol),
  ]);

  autoTable(doc, {
    head: [['Description', 'Qté', 'Prix unitaire', 'Remise', 'TVA', 'Total']],
    body: tableData,
    startY: blockY + 54,
    theme: 'plain',
    styles: { font: 'helvetica', lineColor: line, lineWidth: 0.1 },
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: ink,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    alternateRowStyles: { fillColor: soft },
    columnStyles: {
      0: { halign: 'left', cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 14 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'right', cellWidth: 34, fontStyle: 'bold' },
    },
    margin: { left: M, right: M },
  });

  /* ---------------- TOTAUX ---------------- */
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  const boxW = 78;
  const boxX = pageWidth - M - boxW;
  let ty = finalY + 10;

  const rows: [string, string][] = [['Sous-total HT', formatAmount(invoice.subtotal, currencySymbol)]];
  if (invoice.discount_amount > 0) rows.push(['Remise', '- ' + formatAmount(invoice.discount_amount, currencySymbol)]);
  rows.push(['TVA', formatAmount(invoice.tax_amount, currencySymbol)]);

  doc.setFontSize(9);
  rows.forEach(([k, v]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayText);
    doc.text(k, boxX, ty);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...ink);
    doc.text(v, pageWidth - M, ty, { align: 'right' });
    ty += 7;
  });

  doc.setFillColor(...navy);
  doc.roundedRect(boxX - 4, ty - 1, boxW + 4, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL TTC', boxX, ty + 8);
  doc.setFontSize(12);
  doc.text(formatAmount(invoice.total_amount, currencySymbol), pageWidth - M, ty + 8.3, { align: 'right' });

  /* ---------------- NOTES / CONDITIONS ---------------- */
  let by = finalY + 12;
  const noteW = pageWidth - M * 2 - boxW - 12;

  const writeBlock = (title: string, content: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...blue);
    doc.text(title, M, by);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...grayText);
    const lines = doc.splitTextToSize(content, noteW);
    doc.text(lines, M, by + 5);
    by += 5 + lines.length * 4 + 7;
  };

  if (invoice.notes) writeBlock('NOTES', invoice.notes);
  if (invoice.terms) writeBlock('CONDITIONS DE PAIEMENT', invoice.terms);

  /* ---------------- PIED DE PAGE ---------------- */
  doc.setDrawColor(...line);
  doc.setLineWidth(0.3);
  doc.line(M, pageHeight - 18, pageWidth - M, pageHeight - 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayText);
  doc.text(invoice.company_name || '', M, pageHeight - 12);
  doc.text(
    `Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
    pageWidth - M,
    pageHeight - 12,
    { align: 'right' }
  );

  const filename = `${invoice.document_type}-${invoice.document_number}.pdf`;
  doc.save(filename);
};
