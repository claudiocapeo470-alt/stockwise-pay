import { useState, useEffect } from "react";
import { useCompanySettings, CompanySettings as CompanySettingsType } from "@/hooks/useCompanySettings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function CompanySettings() {
  const { settings, isLoading, saveSettings } = useCompanySettings();
  const [formData, setFormData] = useState<CompanySettingsType>({
    company_name: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(formData);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Building2 className="h-4 w-4 text-muted-foreground" /> Informations de l'entreprise
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="company_name">Nom de l'entreprise *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="company_address">Adresse</Label>
              <Input
                id="company_address"
                value={formData.company_address || ''}
                onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company_postal_code">Code postal</Label>
              <Input
                id="company_postal_code"
                value={formData.company_postal_code || ''}
                onChange={(e) => setFormData({ ...formData, company_postal_code: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company_city">Ville</Label>
              <Input
                id="company_city"
                value={formData.company_city || ''}
                onChange={(e) => setFormData({ ...formData, company_city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company_phone">Téléphone</Label>
              <Input
                id="company_phone"
                value={formData.company_phone || ''}
                onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company_email">Email</Label>
              <Input
                id="company_email"
                type="email"
                value={formData.company_email || ''}
                onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company_siret">SIRET</Label>
              <Input
                id="company_siret"
                value={formData.company_siret || ''}
                onChange={(e) => setFormData({ ...formData, company_siret: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company_tva">Numéro de TVA</Label>
              <Input
                id="company_tva"
                value={formData.company_tva || ''}
                onChange={(e) => setFormData({ ...formData, company_tva: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" className="w-full sm:w-auto h-11">
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
