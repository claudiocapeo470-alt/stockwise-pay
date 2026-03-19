import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "./useCompany";
import { toast } from "sonner";

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_rate: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  position: number;
}

export interface Invoice {
  id?: string;
  user_id?: string;
  document_type: 'facture' | 'devis';
  document_number: string;
  status: 'brouillon' | 'envoye' | 'paye' | 'annule' | 'accepte' | 'refuse';
  client_name: string;
  client_address?: string;
  client_city?: string;
  client_postal_code?: string;
  client_email?: string;
  client_phone?: string;
  client_logo_url?: string;
  company_name?: string;
  company_address?: string;
  company_city?: string;
  company_postal_code?: string;
  company_phone?: string;
  company_email?: string;
  company_siret?: string;
  company_tva?: string;
  company_logo_url?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  issue_date: string;
  due_date?: string;
  notes?: string;
  terms?: string;
  created_at?: string;
  updated_at?: string;
  items?: InvoiceItem[];
}

export const useInvoices = (documentType?: 'facture' | 'devis') => {
  const { user, isEmployee } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  const effectiveUserId = isEmployee ? company?.owner_id : user?.id;

  const invoicesQuery = useQuery({
    queryKey: ["invoices", effectiveUserId, documentType],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error("User not authenticated");

      let query = supabase
        .from("invoices")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("created_at", { ascending: false });

      if (documentType) {
        query = query.eq("document_type", documentType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  const generateDocumentNumber = async (type: 'facture' | 'devis') => {
    if (!effectiveUserId) throw new Error("User not authenticated");
    const { data, error } = await supabase.rpc("generate_document_number", {
      _user_id: effectiveUserId,
      _document_type: type,
    });
    if (error) throw error;
    return data as string;
  };

  const addInvoice = useMutation({
    mutationFn: async (invoice: Invoice) => {
      if (!effectiveUserId) throw new Error("User not authenticated");
      const documentNumber = await generateDocumentNumber(invoice.document_type);
      const { items, ...invoiceData } = invoice;

      const { data: newInvoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({ ...invoiceData, user_id: effectiveUserId, document_number: documentNumber })
        .select()
        .single();
      if (invoiceError) throw invoiceError;

      if (items && items.length > 0) {
        const itemsToInsert = items.map((item, index) => ({ ...item, invoice_id: newInvoice.id, position: index }));
        const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }
      return newInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Document créé avec succès");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...invoice }: Invoice) => {
      if (!effectiveUserId || !id) throw new Error("Missing required data");
      const { items, ...invoiceData } = invoice;

      const { error: invoiceError } = await supabase
        .from("invoices")
        .update(invoiceData)
        .eq("id", id)
        .eq("user_id", effectiveUserId);
      if (invoiceError) throw invoiceError;

      if (items) {
        await supabase.from("invoice_items").delete().eq("invoice_id", id);
        if (items.length > 0) {
          const itemsToInsert = items.map((item, index) => ({ ...item, invoice_id: id, position: index }));
          const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);
          if (itemsError) throw itemsError;
        }
      }
      return { id, ...invoice };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Document modifié avec succès");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la modification: " + error.message);
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      if (!effectiveUserId) throw new Error("User not authenticated");
      const { error } = await supabase.from("invoices").delete().eq("id", id).eq("user_id", effectiveUserId);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Document supprimé avec succès");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });

  const duplicateInvoice = useMutation({
    mutationFn: async (id: string) => {
      if (!effectiveUserId) throw new Error("User not authenticated");
      const { data: original, error: fetchError } = await supabase.from("invoices").select("*").eq("id", id).single();
      if (fetchError) throw fetchError;

      const { data: items, error: itemsError } = await supabase.from("invoice_items").select("*").eq("invoice_id", id);
      if (itemsError) throw itemsError;

      const documentNumber = await generateDocumentNumber(original.document_type);
      const { data: newInvoice, error: insertError } = await supabase
        .from("invoices")
        .insert({ ...original, id: undefined, document_number: documentNumber, status: 'brouillon', created_at: undefined, updated_at: undefined })
        .select()
        .single();
      if (insertError) throw insertError;

      if (items && items.length > 0) {
        const newItems = items.map(item => ({ ...item, id: undefined, invoice_id: newInvoice.id, created_at: undefined }));
        const { error: newItemsError } = await supabase.from("invoice_items").insert(newItems);
        if (newItemsError) throw newItemsError;
      }
      return newInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Document dupliqué avec succès");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la duplication: " + error.message);
    },
  });

  return {
    invoices: invoicesQuery.data ?? [],
    isLoading: invoicesQuery.isLoading,
    error: invoicesQuery.error,
    addInvoice: addInvoice.mutateAsync,
    updateInvoice: updateInvoice.mutateAsync,
    deleteInvoice: deleteInvoice.mutateAsync,
    duplicateInvoice: duplicateInvoice.mutateAsync,
  };
};

export const useInvoiceDetails = (invoiceId: string | undefined) => {
  const { user, isEmployee } = useAuth();
  const { company } = useCompany();
  const effectiveUserId = isEmployee ? company?.owner_id : user?.id;

  return useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      if (!effectiveUserId || !invoiceId) throw new Error("Missing required data");
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("user_id", effectiveUserId)
        .single();
      if (invoiceError) throw invoiceError;

      const { data: items, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("position");
      if (itemsError) throw itemsError;

      return { ...invoice, items } as Invoice;
    },
    enabled: !!effectiveUserId && !!invoiceId,
  });
};
