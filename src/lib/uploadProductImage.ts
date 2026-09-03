import { supabase } from "@/integrations/supabase/client";

export interface UploadedProductImage {
  url: string;
  key?: string;
}

/**
 * Envoie un fichier image vers l'Edge Function `upload-product-image`
 * (stockage Cloudflare R2) et retourne l'URL publique + la clé du fichier.
 */
export async function uploadProductImage(file: File): Promise<UploadedProductImage> {
  const formData = new FormData();
  formData.append("file", file);

  const { data, error } = await supabase.functions.invoke("upload-product-image", {
    body: formData,
  });

  if (error) throw new Error(error.message || "Échec de l'upload de l'image");
  if (!data?.url) throw new Error("Réponse invalide du serveur d'upload");

  return { url: data.url as string, key: data.key as string | undefined };
}
