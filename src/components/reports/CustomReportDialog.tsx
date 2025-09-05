import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface CustomReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomReportDialog({ open, onOpenChange }: CustomReportDialogProps) {
  const [reportName, setReportName] = useState("");
  const [dateRange, setDateRange] = useState("last_30_days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedData, setSelectedData] = useState({
    sales: false,
    products: false,
    payments: false,
    customers: false,
  });
  const [selectedMetrics, setSelectedMetrics] = useState({
    revenue: false,
    quantity: false,
    profit: false,
    growth: false,
    trends: false,
  });

  const handleDataChange = (key: string, checked: boolean) => {
    setSelectedData(prev => ({ ...prev, [key]: checked }));
  };

  const handleMetricChange = (key: string, checked: boolean) => {
    setSelectedMetrics(prev => ({ ...prev, [key]: checked }));
  };

  const handleGenerate = () => {
    const selectedDataCount = Object.values(selectedData).filter(Boolean).length;
    const selectedMetricsCount = Object.values(selectedMetrics).filter(Boolean).length;
    
    if (!reportName.trim()) {
      toast.error("Veuillez saisir un nom pour le rapport");
      return;
    }
    
    if (selectedDataCount === 0) {
      toast.error("Veuillez sélectionner au moins un type de données");
      return;
    }
    
    if (selectedMetricsCount === 0) {
      toast.error("Veuillez sélectionner au moins une métrique");
      return;
    }

    if (dateRange === "custom" && (!startDate || !endDate)) {
      toast.error("Veuillez sélectionner une période personnalisée");
      return;
    }

    // Generate the custom report
    toast.success(`Rapport "${reportName}" généré avec succès`);
    onOpenChange(false);
    
    // Reset form
    setReportName("");
    setDateRange("last_30_days");
    setStartDate("");
    setEndDate("");
    setSelectedData({
      sales: false,
      products: false,
      payments: false,
      customers: false,
    });
    setSelectedMetrics({
      revenue: false,
      quantity: false,
      profit: false,
      growth: false,
      trends: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Créer un rapport personnalisé
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Name */}
          <div>
            <Label htmlFor="reportName">Nom du rapport *</Label>
            <Input
              id="reportName"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Ex: Rapport mensuel des ventes"
              className="mt-1"
            />
          </div>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Période d'analyse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dateRange">Sélectionner une période</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_7_days">7 derniers jours</SelectItem>
                    <SelectItem value="last_30_days">30 derniers jours</SelectItem>
                    <SelectItem value="last_3_months">3 derniers mois</SelectItem>
                    <SelectItem value="last_6_months">6 derniers mois</SelectItem>
                    <SelectItem value="last_year">Dernière année</SelectItem>
                    <SelectItem value="custom">Période personnalisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Types de données à inclure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "sales", label: "Ventes", desc: "Données de ventes et transactions" },
                  { key: "products", label: "Produits", desc: "Inventaire et mouvements de stock" },
                  { key: "payments", label: "Paiements", desc: "Historique des paiements" },
                  { key: "customers", label: "Clients", desc: "Informations clients" },
                ].map((item) => (
                  <div key={item.key} className="flex items-start space-x-2">
                    <Checkbox
                      id={item.key}
                      checked={selectedData[item.key as keyof typeof selectedData]}
                      onCheckedChange={(checked) => handleDataChange(item.key, checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={item.key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {item.label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metrics Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Métriques et analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { key: "revenue", label: "Chiffre d'affaires", desc: "Revenus totaux et moyens" },
                  { key: "quantity", label: "Quantités vendues", desc: "Volumes et unités" },
                  { key: "profit", label: "Analyse de rentabilité", desc: "Marges et profits" },
                  { key: "growth", label: "Évolution et croissance", desc: "Comparaisons périodiques" },
                  { key: "trends", label: "Tendances", desc: "Analyse des tendances temporelles" },
                ].map((item) => (
                  <div key={item.key} className="flex items-start space-x-2">
                    <Checkbox
                      id={item.key}
                      checked={selectedMetrics[item.key as keyof typeof selectedMetrics]}
                      onCheckedChange={(checked) => handleMetricChange(item.key, checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={item.key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {item.label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aperçu du rapport</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nom:</span>
                  <Badge variant="outline">{reportName || "Non défini"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Période:</span>
                  <Badge variant="outline">
                    {dateRange === "custom" 
                      ? (startDate && endDate ? `${startDate} - ${endDate}` : "Personnalisée") 
                      : dateRange.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
                    }
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Types de données:</span>
                  <Badge variant="outline">
                    {Object.values(selectedData).filter(Boolean).length} sélectionné(s)
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Métriques:</span>
                  <Badge variant="outline">
                    {Object.values(selectedMetrics).filter(Boolean).length} sélectionnée(s)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleGenerate}
              className="flex-1"
            >
              Générer le rapport
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}