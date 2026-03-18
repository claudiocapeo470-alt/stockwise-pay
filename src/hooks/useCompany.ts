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

export function useCompany() {
  const { user, profile, isEmployee, memberInfo } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompany(null);
      setLoading(false);
      return;
    }

    // If employee, get company from memberInfo instead of creating one
    if (isEmployee && memberInfo?.company_id) {
      supabase
        .from('companies')
        .select('*')
        .eq('id', memberInfo.company_id)
        .maybeSingle()
        .then(({ data }) => {
          setCompany(data as Company | null);
          setLoading(false);
        });
      return;
    }

    // If employee but no company_id yet, wait
    if (isEmployee) {
      setLoading(false);
      return;
    }

    const fetchOrCreateCompany = async () => {
      setLoading(true);
      try {
        const { data: existing, error: fetchError } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching company:', fetchError);
          setLoading(false);
          return;
        }

        if (existing) {
          setCompany(existing as Company);
          setLoading(false);
          return;
        }

        // Auto-create company for this user
        const companyName = profile?.company_name || profile?.first_name 
          ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
          : 'Mon entreprise';

        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert({
            owner_id: user.id,
            name: companyName,
            company_code: '',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating company:', createError);
        } else {
          setCompany(newCompany as Company);
        }
      } catch (error) {
        console.error('Error in fetchOrCreateCompany:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateCompany();
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

  return { company, loading, updateCompany, regenerateCode };
}