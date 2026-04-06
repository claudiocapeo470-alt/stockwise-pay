import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";

export interface CompanySettings {
  id?: string;
  user_id?: string;
  company_name: string;
  company_address?: string;
  company_city?: string;
  company_postal_code?: string;
  company_phone?: string;
  company_email?: string;
  company_siret?: string;
  company_tva?: string;
  logo_url?: string;
}

export const useCompanySettings = () => {
  const { user, isEmployee } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();
  const effectiveUserId = isEmployee ? company?.owner_id : user?.id;

  const settingsQuery = useQuery({
    queryKey: ["company-settings", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .eq("user_id", effectiveUserId)
        .maybeSingle();

      if (error) throw error;
      return data as CompanySettings | null;
    },
    enabled: !!effectiveUserId,
  });

  const saveSettings = useMutation({
    mutationFn: async (settings: CompanySettings) => {
      if (!effectiveUserId) throw new Error("User not authenticated");

      const { data: existing } = await supabase
        .from("company_settings")
        .select("id")
        .eq("user_id", effectiveUserId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("company_settings")
          .update(settings)
          .eq("user_id", effectiveUserId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from("company_settings")
        .insert({ ...settings, user_id: effectiveUserId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings", effectiveUserId] });
      toast.success("Paramètres enregistrés avec succès");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de l'enregistrement: " + error.message);
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    saveSettings: saveSettings.mutateAsync,
  };
};