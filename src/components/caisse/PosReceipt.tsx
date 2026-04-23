import { useEffect, useMemo, useState, useRef } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { Printer, Download, X } from "lucide-react";

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount?: number;
}

export interface ReceiptData {
  // Company
  company_name: string;
  company_logo_url?: string | null;
  company_address?: string | null;
  company_phone?: string | null;
  company_email?: string | null;
  // Transaction
  receipt_number: string;
  transaction_id: string;
  date: Date;
  // Cashier (only if employee)
  cashier_name?: string | null;
  // Customer
  customer_name?: string | null;
  // Items
  items: ReceiptItem[];
  // Totals
  subtotal: number;
  discount_total?: number;
  tax_total?: number;
  total: number;
  // Payment
  payment_method: string;
  amount_paid?: number;
  change_due?: number;
  // Footer
  thank_you_message?: string;
  legal_notice?: string;
}

interface Props {
  open: boolean;
  data: ReceiptData;
  onClose: () => void;
  onNew?: () => void;
}

const formatXOF = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} F`;

export function PosReceipt({ open, data, onClose, onNew }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  const qrPayload = useMemo(
    () =>
      JSON.stringify({
        n: data.receipt_number,
        id: data.transaction_id,
        d: data.date.toISOString(),
        t: data.total,
        p: data.payment_method,
      }),
    [data]
  );

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(qrPayload, { margin: 0, width: 220 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [open, qrPayload]);

  if (!open) return null;

  // ─── Print thermal 80mm ─────────────────────────────────
  const handlePrint = () => {
    const w = window.open("", "", "width=320,height=720");
    if (!w) return;
    const itemsHtml = data.items
      .map(
        (i) => `
        <div class="item">
          <div class="row"><span class="name">${escapeHtml(i.name)}</span></div>
          <div class="row sub"><span>${i.quantity} × ${formatXOF(i.unit_price)}</span><span>${formatXOF(i.total)}</span></div>
          ${i.discount ? `<div class="row sub disc"><span>Remise</span><span>-${formatXOF(i.discount)}</span></div>` : ""}
        </div>`
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reçu ${data.receipt_number}</title>
<style>
@page{size:80mm auto;margin:0}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'Courier New',monospace;font-size:12px;width:80mm;padding:8px;background:#fff;color:#000}
.center{text-align:center}.bold{font-weight:700}.small{font-size:10px}.tiny{font-size:9px}
.divider{border-top:1px dashed #000;margin:6px 0}
.row{display:flex;justify-content:space-between;gap:8px}
.sub{font-size:11px;padding-left:6px}
.disc{color:#000;font-style:italic}
.logo{max-width:50mm;max-height:18mm;margin:0 auto 4px;display:block}
.title{font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.total-block{border-top:2px solid #000;border-bottom:2px solid #000;padding:6px 0;margin:6px 0}
.total-row{font-size:15px;font-weight:700}
.qr{display:block;margin:8px auto 4px;width:32mm;height:32mm}
.foot{text-align:center;margin-top:6px}
</style></head><body>
${data.company_logo_url ? `<img src="${data.company_logo_url}" class="logo" crossorigin="anonymous"/>` : ""}
<div class="center title">${escapeHtml(data.company_name)}</div>
${data.company_address ? `<div class="center small">${escapeHtml(data.company_address)}</div>` : ""}
${data.company_phone ? `<div class="center small">Tél: ${escapeHtml(data.company_phone)}</div>` : ""}
${data.company_email ? `<div class="center tiny">${escapeHtml(data.company_email)}</div>` : ""}
<div class="divider"></div>
<div class="row small"><span>Reçu N°</span><span class="bold">${data.receipt_number}</span></div>
<div class="row small"><span>Date</span><span>${data.date.toLocaleDateString("fr-FR")}</span></div>
<div class="row small"><span>Heure</span><span>${data.date.toLocaleTimeString("fr-FR")}</span></div>
<div class="row tiny"><span>ID</span><span>${data.transaction_id.slice(0, 12)}</span></div>
${data.cashier_name ? `<div class="row small"><span>Caissier</span><span>${escapeHtml(data.cashier_name)}</span></div>` : ""}
${data.customer_name ? `<div class="row small"><span>Client</span><span>${escapeHtml(data.customer_name)}</span></div>` : ""}
<div class="divider"></div>
${itemsHtml}
<div class="divider"></div>
<div class="row small"><span>Sous-total</span><span>${formatXOF(data.subtotal)}</span></div>
${data.discount_total ? `<div class="row small"><span>Remise</span><span>-${formatXOF(data.discount_total)}</span></div>` : ""}
${data.tax_total ? `<div class="row small"><span>Taxes</span><span>${formatXOF(data.tax_total)}</span></div>` : ""}
<div class="total-block">
  <div class="row total-row"><span>TOTAL</span><span>${formatXOF(data.total)}</span></div>
</div>
<div class="row small"><span>Mode</span><span class="bold">${escapeHtml(data.payment_method)}</span></div>
${data.amount_paid !== undefined ? `<div class="row small"><span>Reçu</span><span>${formatXOF(data.amount_paid)}</span></div>` : ""}
${data.change_due && data.change_due > 0 ? `<div class="row small bold"><span>Monnaie</span><span>${formatXOF(data.change_due)}</span></div>` : ""}
<div class="divider"></div>
${qrDataUrl ? `<img src="${qrDataUrl}" class="qr"/><div class="center tiny">Scannez pour vérifier</div>` : ""}
<div class="foot">
  <div class="small bold">${escapeHtml(data.thank_you_message || "Merci pour votre achat !")}</div>
  ${data.legal_notice ? `<div class="tiny" style="margin-top:4px">${escapeHtml(data.legal_notice)}</div>` : ""}
</div>
</body></html>`;
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      setTimeout(() => {
        w.print();
        w.onafterprint = () => w.close();
      }, 300);
    };
  };

  // ─── PDF download (A6 ticket-like) ──────────────────────
  const handlePDF = () => {
    const doc = new jsPDF({ unit: "mm", format: [80, 297] });
    let y = 8;
    const w = 80;
    const cx = w / 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(data.company_name.toUpperCase(), cx, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    if (data.company_address) {
      doc.text(data.company_address, cx, y, { align: "center" });
      y += 4;
    }
    if (data.company_phone) {
      doc.text(`Tél: ${data.company_phone}`, cx, y, { align: "center" });
      y += 4;
    }
    if (data.company_email) {
      doc.text(data.company_email, cx, y, { align: "center" });
      y += 4;
    }

    y += 2;
    doc.setLineDashPattern([1, 1], 0);
    doc.line(4, y, w - 4, y);
    y += 4;

    doc.setFontSize(8);
    doc.text(`Reçu N°: ${data.receipt_number}`, 4, y);
    y += 4;
    doc.text(`Date: ${data.date.toLocaleDateString("fr-FR")} ${data.date.toLocaleTimeString("fr-FR")}`, 4, y);
    y += 4;
    doc.setFontSize(7);
    doc.text(`ID: ${data.transaction_id.slice(0, 16)}`, 4, y);
    y += 4;
    doc.setFontSize(8);
    if (data.cashier_name) {
      doc.text(`Caissier: ${data.cashier_name}`, 4, y);
      y += 4;
    }
    if (data.customer_name) {
      doc.text(`Client: ${data.customer_name}`, 4, y);
      y += 4;
    }

    doc.line(4, y, w - 4, y);
    y += 4;

    doc.setFontSize(8);
    data.items.forEach((it) => {
      const name = it.name.length > 32 ? it.name.slice(0, 30) + "…" : it.name;
      doc.setFont("helvetica", "bold");
      doc.text(name, 4, y);
      y += 3.5;
      doc.setFont("helvetica", "normal");
      doc.text(`${it.quantity} × ${formatXOF(it.unit_price)}`, 6, y);
      doc.text(formatXOF(it.total), w - 4, y, { align: "right" });
      y += 4;
      if (it.discount) {
        doc.setFontSize(7);
        doc.text(`Remise: -${formatXOF(it.discount)}`, 6, y);
        y += 3.5;
        doc.setFontSize(8);
      }
    });

    doc.line(4, y, w - 4, y);
    y += 4;

    doc.setFontSize(8);
    doc.text("Sous-total", 4, y);
    doc.text(formatXOF(data.subtotal), w - 4, y, { align: "right" });
    y += 4;
    if (data.discount_total) {
      doc.text("Remise", 4, y);
      doc.text(`-${formatXOF(data.discount_total)}`, w - 4, y, { align: "right" });
      y += 4;
    }
    if (data.tax_total) {
      doc.text("Taxes", 4, y);
      doc.text(formatXOF(data.tax_total), w - 4, y, { align: "right" });
      y += 4;
    }

    doc.setLineWidth(0.5);
    doc.setLineDashPattern([], 0);
    doc.line(4, y, w - 4, y);
    y += 4;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 4, y);
    doc.text(formatXOF(data.total), w - 4, y, { align: "right" });
    y += 5;
    doc.line(4, y, w - 4, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Mode: ${data.payment_method}`, 4, y);
    y += 4;
    if (data.amount_paid !== undefined) {
      doc.text(`Reçu: ${formatXOF(data.amount_paid)}`, 4, y);
      y += 4;
    }
    if (data.change_due && data.change_due > 0) {
      doc.setFont("helvetica", "bold");
      doc.text(`Monnaie: ${formatXOF(data.change_due)}`, 4, y);
      y += 5;
      doc.setFont("helvetica", "normal");
    }

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", cx - 15, y, 30, 30);
      y += 32;
      doc.setFontSize(7);
      doc.text("Scannez pour vérifier", cx, y, { align: "center" });
      y += 5;
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(data.thank_you_message || "Merci pour votre achat !", cx, y, { align: "center" });
    y += 4;
    if (data.legal_notice) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(data.legal_notice, cx, y, { align: "center", maxWidth: w - 8 });
    }

    doc.save(`recu-${data.receipt_number}.pdf`);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full flex items-center justify-center"
          style={{ background: "#F3F4F6" }}
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Receipt preview */}
        <div ref={printRef} className="p-6 max-h-[70vh] overflow-y-auto" style={{ color: "#111827" }}>
          {data.company_logo_url && (
            <img
              src={data.company_logo_url}
              alt="logo"
              className="mx-auto mb-2"
              style={{ maxWidth: 80, maxHeight: 60, objectFit: "contain" }}
            />
          )}
          <div className="text-center">
            <h2 className="text-base font-bold uppercase tracking-wide">{data.company_name}</h2>
            {data.company_address && <p className="text-[11px] text-muted-foreground mt-0.5">{data.company_address}</p>}
            {data.company_phone && <p className="text-[11px] text-muted-foreground">Tél: {data.company_phone}</p>}
            {data.company_email && <p className="text-[10px] text-muted-foreground">{data.company_email}</p>}
          </div>

          <div className="border-t border-dashed my-3" style={{ borderColor: "#D1D5DB" }} />

          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between"><span>Reçu N°</span><span className="font-bold">{data.receipt_number}</span></div>
            <div className="flex justify-between"><span>Date</span><span>{data.date.toLocaleDateString("fr-FR")}</span></div>
            <div className="flex justify-between"><span>Heure</span><span>{data.date.toLocaleTimeString("fr-FR")}</span></div>
            <div className="flex justify-between text-[10px] text-muted-foreground"><span>ID</span><span>{data.transaction_id.slice(0, 12)}</span></div>
            {data.cashier_name && <div className="flex justify-between"><span>Caissier</span><span>{data.cashier_name}</span></div>}
            {data.customer_name && <div className="flex justify-between"><span>Client</span><span>{data.customer_name}</span></div>}
          </div>

          <div className="border-t border-dashed my-3" style={{ borderColor: "#D1D5DB" }} />

          <div className="space-y-2 text-[11px] font-mono">
            {data.items.map((it) => (
              <div key={it.id}>
                <div className="font-semibold">{it.name}</div>
                <div className="flex justify-between pl-2 text-[10px]">
                  <span>{it.quantity} × {formatXOF(it.unit_price)}</span>
                  <span>{formatXOF(it.total)}</span>
                </div>
                {it.discount ? (
                  <div className="flex justify-between pl-2 text-[10px] italic" style={{ color: "#EF4444" }}>
                    <span>Remise</span><span>-{formatXOF(it.discount)}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="border-t border-dashed my-3" style={{ borderColor: "#D1D5DB" }} />

          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between"><span>Sous-total</span><span>{formatXOF(data.subtotal)}</span></div>
            {data.discount_total ? (
              <div className="flex justify-between" style={{ color: "#EF4444" }}>
                <span>Remise</span><span>-{formatXOF(data.discount_total)}</span>
              </div>
            ) : null}
            {data.tax_total ? (
              <div className="flex justify-between"><span>Taxes</span><span>{formatXOF(data.tax_total)}</span></div>
            ) : null}
          </div>

          <div className="my-3 py-2 border-y-2" style={{ borderColor: "#111827" }}>
            <div className="flex justify-between text-base font-bold">
              <span>TOTAL</span><span>{formatXOF(data.total)}</span>
            </div>
          </div>

          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between"><span>Mode</span><span className="font-bold">{data.payment_method}</span></div>
            {data.amount_paid !== undefined && (
              <div className="flex justify-between"><span>Reçu</span><span>{formatXOF(data.amount_paid)}</span></div>
            )}
            {data.change_due && data.change_due > 0 ? (
              <div className="flex justify-between font-bold"><span>Monnaie</span><span>{formatXOF(data.change_due)}</span></div>
            ) : null}
          </div>

          {qrDataUrl && (
            <div className="text-center mt-4">
              <img src={qrDataUrl} alt="QR" className="mx-auto" style={{ width: 96, height: 96 }} />
              <p className="text-[10px] text-muted-foreground mt-1">Scannez pour vérifier</p>
            </div>
          )}

          <div className="text-center mt-4">
            <p className="text-xs font-semibold">{data.thank_you_message || "Merci pour votre achat !"}</p>
            {data.legal_notice && <p className="text-[10px] text-muted-foreground mt-1">{data.legal_notice}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 p-4 border-t" style={{ borderColor: "#E5E7EB", background: "#F9FAFB" }}>
          <button
            onClick={handlePrint}
            className="h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"
            style={{ background: "#4F46E5", color: "#fff" }}
          >
            <Printer className="h-4 w-4" /> Imprimer
          </button>
          <button
            onClick={handlePDF}
            className="h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"
            style={{ background: "#10B981", color: "#fff" }}
          >
            <Download className="h-4 w-4" /> PDF
          </button>
          <button
            onClick={onNew || onClose}
            className="h-11 rounded-xl font-semibold text-sm"
            style={{ background: "#E5E7EB", color: "#111827" }}
          >
            Nouveau
          </button>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
