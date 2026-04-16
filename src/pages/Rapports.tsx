import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [salesChartType, setSalesChartType] = useState<ChartType>('area');
  const [revenueChartType, setRevenueChartType] = useState<ChartType>('bar');
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

  const ChartTypeSelector = ({ value, onChange, options }: { value: ChartType; onChange: (v: ChartType) => void; options: ChartType[] }) => (
    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
      {options.map(opt => {
        const Icon = opt === 'area' ? Activity : opt === 'bar' ? BarChart3 : opt === 'line' ? LineIcon : opt === 'pie' ? PieIcon : Sparkles;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`p-1.5 rounded-md transition-all ${value === opt ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title={opt}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Rapports & Analyses</h1>
          </div>
          <p className="text-sm text-muted-foreground">Visualisez vos données en temps réel avec des graphiques interactifs</p>
        </div>
        <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
          <SelectTrigger className="w-full sm:w-44">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
            <SelectItem value="all">Toute la période</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard icon={TrendingUp} label="Chiffre d'affaires" value={formatCurrency(metrics.totalRevenue)} sublabel={`${metrics.totalSales} ventes`} gradient="from-blue-500 to-cyan-500" />
        <KPICard icon={Wallet} label="Encaissé" value={formatCurrency(metrics.totalPaid)} sublabel={`${metrics.paymentRate}% recouvré`} gradient="from-emerald-500 to-teal-500" />
        <KPICard icon={Package} label="Valeur stock" value={formatCurrency(metrics.stockValue)} sublabel={`${metrics.totalProducts} produits`} gradient="from-purple-500 to-pink-500" />
        <KPICard icon={Activity} label="Panier moyen" value={formatCurrency(metrics.avgSale)} sublabel="par transaction" gradient="from-orange-500 to-red-500" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales Chart */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Évolution des ventes</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Nombre de ventes par jour</p>
              </div>
              <ChartTypeSelector value={salesChartType} onChange={setSalesChartType} options={['area', 'line', 'bar']} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart(salesChartType, 'ventes', 'hsl(var(--primary))')}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> Chiffre d'affaires</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Revenus quotidiens</p>
              </div>
              <ChartTypeSelector value={revenueChartType} onChange={setRevenueChartType} options={['bar', 'area', 'line']} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart(revenueChartType, 'revenu', '#10b981')}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Categories Pie */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><PieIcon className="h-4 w-4 text-purple-500" /> Répartition par catégorie</CardTitle>
            <p className="text-xs text-muted-foreground">Valeur du stock par catégorie</p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">{renderChart('pie', 'ventes', '')}</ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Aucune donnée</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Radial */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-orange-500" /> Taux de recouvrement</CardTitle>
            <p className="text-xs text-muted-foreground">Performance de paiement</p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="60%" outerRadius="100%" data={paymentRadial} startAngle={180} endAngle={0}>
                  <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" cornerRadius={10} fill="hsl(var(--primary))" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-4xl font-bold text-foreground">{metrics.paymentRate}%</div>
                <div className="text-xs text-muted-foreground mt-1">recouvré</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/60">
              <div>
                <p className="text-xs text-muted-foreground">Encaissé</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(metrics.totalPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En attente</p>
                <p className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(metrics.totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" /> Rapports détaillés
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReportCard
            title="Ventes"
            icon={TrendingUp}
            color="blue"
            stats={[{ label: 'Total', value: metrics.totalSales }, { label: 'CA', value: formatCurrency(metrics.totalRevenue) }]}
            onView={() => { setSelectedReportType('sales'); setShowReportDialog(true); }}
            onExcel={() => handleExport('excel', 'sales')}
            onPDF={() => handleExport('pdf', 'sales')}
          />
          <ReportCard
            title="Stocks"
            icon={Package}
            color="emerald"
            stats={[{ label: 'Produits', value: metrics.totalProducts }, { label: 'Stock bas', value: metrics.lowStockProducts }]}
            onView={() => { setSelectedReportType('inventory'); setShowReportDialog(true); }}
            onExcel={() => handleExport('excel', 'products')}
            onPDF={() => handleExport('pdf', 'products')}
          />
          <ReportCard
            title="Paiements"
            icon={Wallet}
            color="orange"
            stats={[{ label: 'Recouvrés', value: `${metrics.paymentRate}%` }, { label: 'Encaissé', value: formatCurrency(metrics.totalPaid) }]}
            onView={() => { setSelectedReportType('payments'); setShowReportDialog(true); }}
            onExcel={() => handleExport('excel', 'payments')}
            onPDF={() => handleExport('pdf', 'payments')}
          />
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

function KPICard({ icon: Icon, label, value, sublabel, gradient }: any) {
  return (
    <Card className="overflow-hidden border-border/60 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-foreground mt-0.5 truncate">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sublabel}</p>
      </CardContent>
    </Card>
  );
}

function ReportCard({ title, icon: Icon, color, stats, onView, onExcel, onPDF }: any) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-cyan-500',
    emerald: 'from-emerald-500 to-teal-500',
    orange: 'from-orange-500 to-red-500',
  };
  return (
    <Card className="border-border/60 hover:shadow-md transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <Badge variant="secondary" className="text-[10px] mt-0.5">Temps réel</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
          {stats.map((s: any, i: number) => (
            <div key={i}>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p className="text-sm font-semibold text-foreground truncate">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="default" className="flex-1 h-8 text-xs" onClick={onView}>
            <Eye className="h-3 w-3 mr-1" /> Voir
          </Button>
          <Button size="sm" variant="outline" className="h-8 px-2" onClick={onExcel} title="Excel">
            <FileSpreadsheet className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 px-2" onClick={onPDF} title="PDF">
            <FileText className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
