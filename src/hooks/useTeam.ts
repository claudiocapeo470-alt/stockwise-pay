import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from './useCompany';

// ---- Types ----
export interface CompanyService {
  id: string;
  company_id: string;
  name: string;
  color: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface CompanyRole {
  id: string;
  company_id: string;
  name: string;
  is_system: boolean;
  permissions: Record<string, any>;
  service_id: string | null;
  created_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string | null;
  photo_url: string | null;
  is_active: boolean;
  role_id: string | null;
  service_id: string | null;
  auth_user_id: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  role?: CompanyRole;
  service?: CompanyService;
}

function generatePin(): string {
  // Cryptographically secure 6-digit PIN
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return ((arr[0] % 900000) + 100000).toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function useTeam() {
  const { company } = useCompany();
  const qc = useQueryClient();
  const companyId = company?.id;

  // ---- Services ----
  const servicesQuery = useQuery({
    queryKey: ['company_services', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_services')
        .select('*')
        .eq('company_id', companyId!)
        .order('sort_order');
      if (error) throw error;
      return data as CompanyService[];
    },
    enabled: !!companyId,
  });

  const createService = useMutation({
    mutationFn: async (s: { name: string; color: string; icon: string }) => {
      const { error } = await supabase.from('company_services').insert({
        company_id: companyId!,
        name: s.name,
        color: s.color,
        icon: s.icon,
        sort_order: (servicesQuery.data?.length || 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company_services', companyId] }),
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CompanyService> & { id: string }) => {
      const { error } = await supabase.from('company_services').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company_services', companyId] }),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('company_services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company_services', companyId] }),
  });

  // ---- Roles ----
  const rolesQuery = useQuery({
    queryKey: ['company_roles', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_roles')
        .select('*')
        .eq('company_id', companyId!)
        .order('is_system', { ascending: false });
      if (error) throw error;
      return data as CompanyRole[];
    },
    enabled: !!companyId,
  });

  const createRole = useMutation({
    mutationFn: async (r: { name: string; service_id?: string; permissions: Record<string, any> }) => {
      const { error } = await supabase.from('company_roles').insert({
        company_id: companyId!,
        name: r.name,
        service_id: r.service_id || null,
        permissions: r.permissions,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company_roles', companyId] }),
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CompanyRole> & { id: string }) => {
      const { error } = await supabase.from('company_roles').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company_roles', companyId] }),
  });

  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('company_roles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company_roles', companyId] }),
  });

  // ---- Members ----
  const membersQuery = useQuery({
    queryKey: ['company_members', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_members')
        .select('*, company_roles(*), company_services(*)')
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((m: any) => ({
        ...m,
        role: m.company_roles || undefined,
        service: m.company_services || undefined,
      })) as CompanyMember[];
    },
    enabled: !!companyId,
  });

  const createMember = useMutation({
    mutationFn: async (m: { first_name: string; last_name?: string; role_id?: string; service_id?: string; photo_url?: string; pin_code?: string }) => {
      const pin = m.pin_code || generatePin();
      const { data, error } = await supabase.from('company_members').insert({
        company_id: companyId!,
        first_name: m.first_name,
        last_name: m.last_name || null,
        role_id: m.role_id || null,
        service_id: m.service_id || null,
        photo_url: m.photo_url || null,
        pin_code: pin,
      }).select().single();
      if (error) throw error;
      return { ...data, generatedPin: pin };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company_members', companyId] }),
  });

  const updateMember = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CompanyMember> & { id: string }) => {
      const { error } = await supabase.from('company_members').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company_members', companyId] }),
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('company_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company_members', companyId] }),
  });

  return {
    // services
    services: servicesQuery.data || [],
    servicesLoading: servicesQuery.isLoading,
    createService,
    updateService,
    deleteService,
    // roles
    roles: rolesQuery.data || [],
    rolesLoading: rolesQuery.isLoading,
    createRole,
    updateRole,
    deleteRole,
    // members
    members: membersQuery.data || [],
    membersLoading: membersQuery.isLoading,
    createMember,
    updateMember,
    deleteMember,
    // utils
    generatePin,
    companyId,
  };
}
