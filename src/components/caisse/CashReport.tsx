import { useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CashReportData {
  companyName: string;
  cashierName: string;
  openedAt: string;
  closedAt: string;
  openingAmount: number;
  totalSales: number;
  totalCash: number;
  totalMobileMoney: number;
  totalCard: number;
  totalExpenses: number;
  totalEntries: number;
  expectedAmount: number;
  closingAmount: number;
  difference: number;
  closingNotes?: string;
}

export function generateCashReportPDF(data: CashReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.companyName, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Rapport de Clôture de Caisse", pageWidth / 2, 30, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Caissier: ${data.cashierName}`, pageWidth / 2, 38, { align: "center" });
  doc.setTextColor(0);

  // Session info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Informations de la session", 14, 50);

  autoTable(doc, {
    startY: 54,
    head: [],
    body: [
      ["Ouverture", data.openedAt],
      ["Fermeture", data.closedAt],
      ["Fond de caisse", `${data.openingAmount.toLocaleString("fr-FR")} FCFA`],
    ],
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { halign: "right" },
    },
  });

  // Sales breakdown
  const y1 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Détail des ventes", 14, y1);

  autoTable(doc, {
    startY: y1 + 4,
    head: [["Libellé", "Montant"]],
    body: [
      ["Total des ventes", `${data.totalSales.toLocaleString("fr-FR")} FCFA`],
      ["  > Espèces", `${data.totalCash.toLocaleString("fr-FR")} FCFA`],
      ["  > Mobile Money", `${data.totalMobileMoney.toLocaleString("fr-FR")} FCFA`],
      ["  > Carte bancaire", `${data.totalCard.toLocaleString("fr-FR")} FCFA`],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      1: { halign: "right" },
    },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Movements
  const y2 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Mouvements de caisse", 14, y2);

  autoTable(doc, {
    startY: y2 + 4,
    head: [["Libellé", "Montant"]],
    body: [
      ["Dépenses de caisse", `- ${data.totalExpenses.toLocaleString("fr-FR")} FCFA`],
      ["Entrées d'argent", `+ ${data.totalEntries.toLocaleString("fr-FR")} FCFA`],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      1: { halign: "right" },
    },
    headStyles: { fillColor: [34, 197, 94] },
  });

  // Closing summary
  const y3 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Bilan de clôture", 14, y3);

  const diffColor = data.difference >= 0 ? [34, 197, 94] : [239, 68, 68];
  const diffSign = data.difference >= 0 ? "+" : "";

  autoTable(doc, {
    startY: y3 + 4,
    head: [],
    body: [
      ["Solde théorique", `${data.expectedAmount.toLocaleString("fr-FR")} FCFA`],
      ["Solde compté", `${data.closingAmount.toLocaleString("fr-FR")} FCFA`],
      ["Écart", `${diffSign}${data.difference.toLocaleString("fr-FR")} FCFA`],
    ],
    theme: "plain",
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { halign: "right", fontStyle: "bold" },
    },
    didParseCell: (hookData: any) => {
      if (hookData.row.index === 2) {
        hookData.cell.styles.textColor = diffColor;
      }
    },
  });

  // Notes
  if (data.closingNotes) {
    const y4 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Notes:", 14, y4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(data.closingNotes, 14, y4 + 6, { maxWidth: pageWidth - 28 });
  }

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Généré par Stocknix — ${new Date().toLocaleString("fr-FR")}`, pageWidth / 2, Math.min(finalY, 280), { align: "center" });

  doc.save(`rapport-caisse-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function CashReportPreview({ data }: { data: CashReportData }) {
  const diffSign = data.difference >= 0 ? "+" : "";
  const diffClass = data.difference >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div className="font-mono text-xs space-y-1" style={{ color: "#e5e5e5" }}>
      <p className="text-center font-bold text-white text-sm">{data.companyName}</p>
      <p className="text-center text-gray-500 text-[10px]">RAPPORT DE CLÔTURE</p>
      <p className="text-center text-gray-500 text-[10px]">Caissier: {data.cashierName}</p>
      <div className="border-t border-dashed border-gray-600 my-2" />
      <Row label="Caisse ouverte" value={data.openedAt} />
      <Row label="Caisse fermée" value={data.closedAt} />
      <Row label="Fond de départ" value={`${data.openingAmount.toLocaleString()} F`} />
      <div className="border-t border-dashed border-gray-600 my-2" />
      <Row label="Total ventes" value={`${data.totalSales.toLocaleString()} F`} bold />
      <Row label="  > Espèces" value={`${data.totalCash.toLocaleString()} F`} />
      <Row label="  > Mobile Money" value={`${data.totalMobileMoney.toLocaleString()} F`} />
      <Row label="  > CB" value={`${data.totalCard.toLocaleString()} F`} />
      <div className="border-t border-dashed border-gray-600 my-2" />
      <Row label="Dépenses caisse" value={`${data.totalExpenses.toLocaleString()} F`} />
      <Row label="Entrées argent" value={`${data.totalEntries.toLocaleString()} F`} />
      <div className="border-t border-dashed border-gray-600 my-2" />
      <Row label="Solde théorique" value={`${data.expectedAmount.toLocaleString()} F`} bold />
      <Row label="Solde compté" value={`${data.closingAmount.toLocaleString()} F`} bold />
      <div className="flex justify-between font-bold">
        <span>Écart</span>
        <span className={diffClass}>{diffSign}{data.difference.toLocaleString()} F</span>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-white" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
