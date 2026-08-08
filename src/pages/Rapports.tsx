import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download, TrendingUp, BarChart3, PieChart as PieIcon, LineChart as LineIcon,
  Activity, Sparkles, Eye, FileSpreadsheet, FileText, Calendar, Wallet, Package
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ReportDialog } from "@/components/reports/ReportDialog";
import { useCurrency } from "@/hooks/useCurrency";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

type ChartType = 'area' | 'bar' | 'line' | 'pie' | 'radial';
type Period = '7' | '30' | '90' | 'all';

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Rapports() {
  const { products = [] } = useProducts();
  const { sales = [] } = useSales();
  const { payments = [] } = usePayments();
  const { formatCurrency } = useCurrency();
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [period, setPeriod] = useState<Period>('30');

  // ─── METRICS ───
  const metrics = useMemo(() => {
    const totalRevenue = sales.reduce((s, x) => s + Number(x.total_amount), 0);
    const completedPayments = payments.filter(p => p.status === 'completed');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    return {
      totalSales: sales.length,
      totalRevenue,
      avgSale: sales.length > 0 ? totalRevenue / sales.length : 0,
      totalProducts: products.length,
      lowStockProducts: products.filter(p => p.quantity <= p.min_quantity).length,
      outOfStockProducts: products.filter(p => p.quantity === 0).length,
      stockValue: products.reduce((s, p) => s + p.price * p.quantity, 0),
      totalPaid: completedPayments.reduce((s, p) => s + Number(p.total_amount), 0),
      totalPending: pendingPayments.reduce((s, p) => s + Number(p.total_amount), 0),
      paymentRate: payments.length > 0 ? Math.round((completedPayments.length / payments.length) * 100) : 0,
    };
  }, [products, sales, payments]);

  // ─── CHART DATA ───
  const days = period === 'all' ? 365 : parseInt(period);
  const chartData = useMemo(() => {
    const data: { date: string; ventes: number; revenu: number; label: string }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const next = startOfDay(subDays(new Date(), i - 1));
      const dailySales = sales.filter(s => {
        const d = new Date(s.created_at);
        return d >= day && d < next;
      });
      data.push({
        date: format(day, 'dd/MM'),
        label: format(day, 'dd MMM', { locale: fr }),
        ventes: dailySales.length,
        revenu: dailySales.reduce((s, x) => s + Number(x.total_amount), 0),
      });
    }
    return data;
  }, [sales, days]);

  // Top categories pie data
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => {
      const cat = p.category || 'Sans catégorie';
      map.set(cat, (map.get(cat) || 0) + p.price * p.quantity);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).slice(0, 6);
  }, [products]);

  // Payment status radial
  const paymentRadial = useMemo(() => [
    { name: 'Recouvrement', value: metrics.paymentRate, fill: 'hsl(var(--primary))' }
  ], [metrics.paymentRate]);

  // ─── EXPORTS ───
  const handleExport = (type: 'csv' | 'excel' | 'pdf', data: string) => {
    if (type === 'excel') return handleExcel(data);
    if (type === 'pdf') return handlePDF(data);
    let content = '';
    let filename = '';
    if (data === 'sales') {
      content = 'Date,Produit,Client,Quantité,Prix unitaire,Total\n';
      sales.forEach(s => {
        const p = products.find(x => x.id === s.product_id);
        content += `${new Date(s.created_at).toLocaleDateString()},${p?.name || 'N/A'},${s.customer_name || 'N/A'},${s.quantity},${s.unit_price},${s.total_amount}\n`;
      });
    } else if (data === 'products') {
      content = 'Nom,Catégorie,Prix,Quantité,Stock min\n';
      products.forEach(p => content += `${p.name},${p.category || 'N/A'},${p.price},${p.quantity},${p.min_quantity}\n`);
    } else if (data === 'payments') {
      content = 'Date,Client,Montant,Méthode,Statut\n';
      payments.forEach(p => {
        const n = `${p.customer_first_name || ''} ${p.customer_last_name || ''}`.trim() || 'N/A';
        content += `${new Date(p.created_at).toLocaleDateString()},${n},${p.total_amount},${p.payment_method},${p.status}\n`;
      });
    }
    filename = `${data}_${new Date().toISOString().split('T')[0]}.csv`;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename} téléchargé`);
  };

  const handleExcel = (data: string) => {
    const wb = XLSX.utils.book_new();
    let rows: any[] = [];
    if (data === 'sales') rows = sales.map(s => ({ Date: new Date(s.created_at).toLocaleDateString('fr-FR'), Client: s.customer_name || '', Quantité: s.quantity, Total: Number(s.total_amount) }));
    else if (data === 'products') rows = products.map(p => ({ Nom: p.name, Catégorie: p.category || '', Prix: p.price, Stock: p.quantity }));
    else if (data === 'payments') rows = payments.map(p => ({ Date: new Date(p.created_at).toLocaleDateString('fr-FR'), Client: `${p.customer_first_name || ''} ${p.customer_last_name || ''}`.trim(), Montant: Number(p.total_amount), Statut: p.status }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), data);
    XLSX.writeFile(wb, `${data}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel téléchargé');
  };

  const handlePDF = (data: string) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Rapport ${data}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
    let head: string[][] = [], body: any[][] = [];
    if (data === 'sales') {
      head = [['Date', 'Client', 'Qté', 'Total']];
      body = sales.map(s => [new Date(s.created_at).toLocaleDateString('fr-FR'), s.customer_name || 'N/A', s.quantity, formatCurrency(Number(s.total_amount))]);
    } else if (data === 'products') {
      head = [['Nom', 'Catégorie', 'Prix', 'Stock']];
      body = products.map(p => [p.name, p.category || 'N/A', formatCurrency(p.price), p.quantity]);
    } else if (data === 'payments') {
      head = [['Date', 'Client', 'Montant', 'Statut']];
      body = payments.map(p => [new Date(p.created_at).toLocaleDateString('fr-FR'), `${p.customer_first_name || ''} ${p.customer_last_name || ''}`.trim() || 'N/A', formatCurrency(Number(p.total_amount)), p.status]);
    }
    autoTable(doc, { startY: 35, head, body, theme: 'striped', headStyles: { fillColor: [10, 26, 59] } });
    doc.save(`${data}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF téléchargé');
  };

  // ─── CHART RENDERER ───
  const renderChart = (type: ChartType, dataKey: 'ventes' | 'revenu', color: string) => {
    if (type === 'area') return (
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#grad-${dataKey})`} />
      </AreaChart>
    );
    if (type === 'line') return (
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} />
      </LineChart>
    );
    if (type === 'bar') return (
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    );
    if (type === 'pie') return (
      <PieChart>
        <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
        <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
          {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    );
    return (
      <RadialBarChart innerRadius="40%" outerRadius="100%" data={paymentRadial} startAngle={180} endAngle={0}>
        <RadialBar background dataKey="value" cornerRadius={10} />
        <Tooltip />
      </RadialBarChart>
    );
  };

  const PERIODS: { v: Period; l: string }[] = [
    { v: '7', l: '7 j' }, { v: '30', l: '30 j' }, { v: '90', l: '90 j' }, { v: 'all', l: 'Tout' },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      {/* Sélecteur de période — pilule segmentée */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/60 shrink-0">
          {PERIODS.map(p => (
            <button
              key={p.v}
              onClick={() => setPeriod(p.v)}
              className={`h-9 px-4 rounded-full text-sm font-medium transition-colors ${
                period === p.v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>
        <span className="hidden sm:block text-sm text-muted-foreground ml-2 truncate">
          Suivi de votre activité en temps réel
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard icon={TrendingUp} tint="primary" label="Chiffre d'affaires" value={formatCurrency(metrics.totalRevenue)} sublabel={`${metrics.totalSales} ventes`} />
        <KPICard icon={Wallet} tint="success" label="Encaissé" value={formatCurrency(metrics.totalPaid)} sublabel={`${metrics.paymentRate}% recouvré`} />
        <KPICard icon={Package} tint="warning" label="Valeur stock" value={formatCurrency(metrics.stockValue)} sublabel={`${metrics.totalProducts} produits`} />
        <KPICard icon={Activity} tint="accent" label="Panier moyen" value={formatCurrency(metrics.avgSale)} sublabel="par transaction" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Évolution des ventes</h3>
          </div>
          <div className="h-[190px] sm:h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart('area', 'ventes', 'hsl(var(--primary))')}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <h3 className="text-sm font-semibold">Chiffre d'affaires</h3>
          </div>
          <div className="h-[190px] sm:h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart('bar', 'revenu', 'hsl(var(--primary))')}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Rapports détaillés
        </h2>
        <div className="-mx-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          <div className="flex gap-3 w-max pb-1">
          <ReportCard
            title="Ventes"
            icon={TrendingUp}
            tint="primary"
            stats={[{ label: 'Total', value: metrics.totalSales }, { label: 'CA', value: formatCurrency(metrics.totalRevenue) }]}
            onView={() => { setSelectedReportType('sales'); setShowReportDialog(true); }}
            onExcel={() => handleExport('excel', 'sales')}
            onPDF={() => handleExport('pdf', 'sales')}
          />
          <ReportCard
            title="Stocks"
            icon={Package}
            tint="warning"
            stats={[{ label: 'Produits', value: metrics.totalProducts }, { label: 'Stock bas', value: metrics.lowStockProducts }]}
            onView={() => { setSelectedReportType('inventory'); setShowReportDialog(true); }}
            onExcel={() => handleExport('excel', 'products')}
            onPDF={() => handleExport('pdf', 'products')}
          />
          <ReportCard
            title="Paiements"
            icon={Wallet}
            tint="success"
            stats={[{ label: 'Recouvrés', value: `${metrics.paymentRate}%` }, { label: 'Encaissé', value: formatCurrency(metrics.totalPaid) }]}
            onView={() => { setSelectedReportType('payments'); setShowReportDialog(true); }}
            onExcel={() => handleExport('excel', 'payments')}
            onPDF={() => handleExport('pdf', 'payments')}
          />
          </div>
        </div>

      </div>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reportType={selectedReportType}
      />
    </div>
  );
}

const TINTS: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  accent: 'bg-accent/10 text-accent-foreground',
};

function KPICard({ icon: Icon, label, value, sublabel, tint = 'primary' }: any) {
  return (
    <div className="rounded-3xl bg-card p-4 shadow-sm">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 ${TINTS[tint]}`}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <p className="text-lg sm:text-xl font-bold text-foreground truncate">{value}</p>
      <p className="text-xs text-muted-foreground truncate">{label}</p>
      <p className="text-[11px] text-muted-foreground/70 truncate">{sublabel}</p>
    </div>
  );
}

function ReportCard({ title, icon: Icon, stats, onView, onExcel, onPDF, tint = 'primary' }: any) {
  return (
    <div className="rounded-3xl bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${TINTS[tint]}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s: any, i: number) => (
          <div key={i} className="min-w-0 rounded-2xl bg-muted/50 px-3 py-2">
            <p className="text-[11px] text-muted-foreground truncate">{s.label}</p>
            <p className="text-sm font-semibold text-foreground truncate">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 h-10 rounded-full text-xs" onClick={onView}>
          <Eye className="h-3.5 w-3.5 mr-1" /> Voir
        </Button>
        <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" onClick={onExcel} title="Excel">
          <FileSpreadsheet className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" onClick={onPDF} title="PDF">
          <FileText className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


