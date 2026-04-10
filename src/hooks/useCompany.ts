import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Company {
  id: string;
  owner_id: string;
  name: string;
  company_code: string;
  logo_url: string | null;
  lock_timeout_minutes: number;
  selected_modules: string[] | null;
  onboarding_completed: boolean;
  company_name_set: boolean;
  created_at: string;
  updated_at: string;
}

const ALL_MODULES = ['boutique', 'pos', 'stock'];
const DEFAULT_COMPANY_NAME = 'Mon entreprise';

const normalizeText = (value: string | null | undefined) => value?.trim() || '';

const getFallbackCompanyName = (profile: { company_name: string | null; first_name: string | null; last_name: string | null } | null) => {
  const explicitCompanyName = normalizeText(profile?.company_name);
  if (explicitCompanyName) return explicitCompanyName;
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  return fullName || DEFAULT_COMPANY_NAME;
};

const hasExplicitCompanyName = (
  company: Company,
  profile: { company_name: string | null; first_name: string | null; last_name: string | null } | null,
) => {
  const profileCompanyName = normalizeText(profile?.company_name);
  if (profileCompanyName) return true;
  if (company.company_name_set) return true;
  const currentName = normalizeText(company.name);
  const fallbackName = getFallbackCompanyName(profile);
  return !!currentName && currentName !== DEFAULT_COMPANY_NAME && currentName !== fallbackName;
};

async function detectLegacyUsage(ownerId: string, companyId: string) {
  const [productsResult, salesResult, paymentsResult, storeResult, membersResult, settingsResult] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', ownerId),
    supabase.from('sales').select('id', { count: 'exact', head: true }).eq('user_id', ownerId),
    supabase.from('payments').select('id', { count: 'exact', head: true }).eq('user_id', ownerId),
    supabase.from('online_store').select('id', { count: 'exact', head: true }).eq('user_id', ownerId),
    supabase.from('company_members').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('company_settings').select('id', { count: 'exact', head: true }).eq('user_id', ownerId),
  ]);

  const counts = [productsResult, salesResult, paymentsResult, storeResult, membersResult, settingsResult].map((result) => result.count || 0);
  return counts.some((count) => count > 0);
}

// Also try to sync company name from company_settings if available
async function syncCompanyNameFromSettings(ownerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('company_settings')
    .select('company_name')
    .eq('user_id', ownerId)
    .maybeSingle();
  return data?.company_name?.trim() || null;
}

export function useCompany() {
  const { user, profile, isEmployee, memberInfo } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureCompany = async () => {
    if (!user || isEmployee) return null;

    try {
      const { data: existingRows, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching company:', fetchError);
        return null;
      }

      const existing = ((existingRows || [])[0] || null) as Company | null;

      if (existing) {
        const hasModules = Array.isArray(existing.selected_modules) && existing.selected_modules.length > 0;
        const explicitNameConfigured = hasExplicitCompanyName(existing, profile);
        
        // Extended legacy detection: also check company_settings
        const hasLegacyData = !existing.onboarding_completed && (!hasModules || !explicitNameConfigured)
          ? await detectLegacyUsage(user.id, existing.id)
          : false;
        
        const shouldBypassOnboarding = existing.onboarding_completed || hasModules || explicitNameConfigured || hasLegacyData;

        const updates: Partial<Company> = {};

        // Sync company name from company_settings if not yet set
        if (!existing.company_name_set && !explicitNameConfigured && hasLegacyData) {
          const settingsName = await syncCompanyNameFromSettings(user.id);
          if (settingsName) {
            updates.name = settingsName;
            updates.company_name_set = true;
          }
        }

        if (!existing.company_name_set && explicitNameConfigured) {
          updates.company_name_set = true;
        }

        if (!hasModules && shouldBypassOnboarding) {
          updates.selected_modules = ALL_MODULES;
        }

        if (!existing.onboarding_completed && shouldBypassOnboarding) {
          updates.onboarding_completed = true;
        }

        if (Object.keys(updates).length > 0) {
          const { data: updatedCompany, error: updateError } = await supabase
            .from('companies')
            .update(updates)
            .eq('id', existing.id)
            .select('*')
            .single();

          if (updateError) {
            console.error('Error normalizing company onboarding:', updateError);
            const merged = { ...existing, ...updates } as Company;
            setCompany(merged);
            return merged;
          }

          setCompany(updatedCompany as Company);
          return updatedCompany as Company;
        }

        setCompany(existing);
        return existing;
      }

      const companyName = getFallbackCompanyName(profile);
      const explicitCompanyName = normalizeText(profile?.company_name);
      const { data: generatedCode, error: codeError } = await supabase.rpc('generate_company_code');

      if (codeError) {
        console.error('Error generating company code:', codeError);
        return null;
      }

      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert({
          owner_id: user.id,
          name: companyName,
          company_code: generatedCode || '',
          company_name_set: !!explicitCompanyName,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating company:', createError);
        return null;
      }

      setCompany(newCompany as Company);
      return newCompany as Company;
    } catch (error) {
      console.error('Error ensuring company:', error);
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setCompany(null);
      setLoading(false);
      return;
    }

    if (isEmployee && memberInfo?.company_id) {
      supabase
        .from('companies')
        .select('*')
        .eq('id', memberInfo.company_id)
        .maybeSingle()
        .then(({ data }) => {
          if (!cancelled) {
            setCompany(data as Company | null);
            setLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }

    if (isEmployee) {
      setLoading(false);
      return;
    }

    const loadCompany = async () => {
      setLoading(true);
      try {
        const resolvedCompany = await ensureCompany();
        if (!cancelled) {
          setCompany(resolvedCompany);
        }
      } catch (error) {
        console.error('Error in loadCompany:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCompany();

    return () => {
      cancelled = true;
    };
  }, [user, profile, isEmployee, memberInfo]);

  const updateCompany = async (updates: Partial<Company>) => {
    if (!company) return;
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', company.id)
      .select()
      .single();

    if (!error && data) {
      setCompany(data as Company);
    }
    return { data, error };
  };

  const regenerateCode = async () => {
    if (!company) return;
    const { data: newCode } = await supabase.rpc('generate_company_code');
    if (newCode) {
      return updateCompany({ company_code: newCode });
    }
  };

  return { company, loading, updateCompany, regenerateCode, ensureCompany };
}
