import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: ["invoices", user?.id, documentType],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      let query = supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (documentType) {
        query = query.eq("document_type", documentType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!user?.id,
  });

  const generateDocumentNumber = async (type: 'facture' | 'devis') => {
    if (!user?.id) throw new Error("User not authenticated");
    
    const { data, error } = await supabase.rpc("generate_document_number", {
      _user_id: user.id,
      _document_type: type,
    });

    if (error) throw error;
    return data as string;
  };

  const addInvoice = useMutation({
    mutationFn: async (invoice: Invoice) => {
      if (!user?.id) throw new Error("User not authenticated");

      const documentNumber = await generateDocumentNumber(invoice.document_type);

      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          ...invoice,
          user_id: user.id,
          document_number: documentNumber,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      if (invoice.items && invoice.items.length > 0) {
        const itemsToInsert = invoice.items.map((item, index) => ({
          ...item,
          invoice_id: invoiceData.id,
          position: index,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      return invoiceData;
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
      if (!user?.id || !id) throw new Error("Missing required data");

      const { error: invoiceError } = await supabase
        .from("invoices")
        .update(invoice)
        .eq("id", id)
        .eq("user_id", user.id);

      if (invoiceError) throw invoiceError;

      if (invoice.items) {
        await supabase.from("invoice_items").delete().eq("invoice_id", id);

        if (invoice.items.length > 0) {
          const itemsToInsert = invoice.items.map((item, index) => ({
            ...item,
            invoice_id: id,
            position: index,
          }));

          const { error: itemsError } = await supabase
            .from("invoice_items")
            .insert(itemsToInsert);

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
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

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
      if (!user?.id) throw new Error("User not authenticated");

      const { data: original, error: fetchError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { data: items, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", id);

      if (itemsError) throw itemsError;

      const documentNumber = await generateDocumentNumber(original.document_type);

      const { data: newInvoice, error: insertError } = await supabase
        .from("invoices")
        .insert({
          ...original,
          id: undefined,
          document_number: documentNumber,
          status: 'brouillon',
          created_at: undefined,
          updated_at: undefined,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (items && items.length > 0) {
        const newItems = items.map(item => ({
          ...item,
          id: undefined,
          invoice_id: newInvoice.id,
          created_at: undefined,
        }));

        const { error: newItemsError } = await supabase
          .from("invoice_items")
          .insert(newItems);

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
  const { user } = useAuth();

  return useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      if (!user?.id || !invoiceId) throw new Error("Missing required data");

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("user_id", user.id)
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
    enabled: !!user?.id && !!invoiceId,
  });
};
