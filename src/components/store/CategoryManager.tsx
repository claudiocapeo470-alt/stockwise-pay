/**
 * CategoryManager.tsx — Gestion des catégories de la boutique en ligne
 * Permet d'uploader une image (max 3 Mo) par catégorie pour l'afficher en mosaïque.
 * Utilise la table `product_categories` (champ `image_url`).
 */
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, Image as ImageIcon, Plus, Tags, Pencil, Check, X } from "lucide-react";

const MAX_SIZE = 3 * 1024 * 1024; // 3 Mo
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  icon_emoji: string | null;
  sort_order: number | null;
  user_id: string;
}

export default function CategoryManager() {
  const { user, isEmployee, memberInfo } = useAuth();
  const { company } = useCompany();
  const qc = useQueryClient();
  const effectiveUserId = isEmployee ? (memberInfo?.owner_id || company?.owner_id) : user?.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  // Charger les catégories existantes (table product_categories) ET les noms uniques utilisés par les produits
  const { data: dbCategories = [], isLoading } = useQuery({
    queryKey: ["store-categories", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as Category[];
    },
    enabled: !!effectiveUserId,
  });

  const { data: productCategoryNames = [] } = useQuery({
    queryKey: ["product-category-names", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data } = await supabase
        .from("products")
        .select("category")
        .eq("user_id", effectiveUserId);
      const names = new Set<string>();
      (data || []).forEach((p: any) => { if (p.category) names.add(p.category); });
      return [...names];
    },
    enabled: !!effectiveUserId,
  });

  // Synthèse : ligne par catégorie (depuis DB OU depuis produits sans entrée DB)
  const allCategories = (() => {
    const map = new Map<string, Category & { fromProduct?: boolean }>();
    dbCategories.forEach(c => map.set(c.name, c));
    productCategoryNames.forEach(n => {
      if (!map.has(n)) {
        map.set(n, { id: `virtual-${n}`, name: n, image_url: null, icon_emoji: "📦", sort_order: 999, user_id: effectiveUserId || "", fromProduct: true });
      }
    });
    return [...map.values()].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  })();

  const upsertCategory = useMutation({
    mutationFn: async (cat: Partial<Category> & { name: string; image_url?: string | null }) => {
      if (!effectiveUserId) throw new Error("Non authentifié");
      // Si c'est une catégorie virtuelle (pas encore en DB), on l'insère
      const existing = dbCategories.find(c => c.name === cat.name);
      if (existing) {
        const { error } = await supabase
          .from("product_categories")
          .update({ image_url: cat.image_url ?? existing.image_url, name: cat.name })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("product_categories")
          .insert({ name: cat.name, image_url: cat.image_url ?? null, user_id: effectiveUserId, icon_emoji: "📦" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-categories", effectiveUserId] });
    },
  });

  const renameCategory = useMutation({
    mutationFn: async ({ oldName, newName, id }: { oldName: string; newName: string; id: string }) => {
      if (!effectiveUserId) throw new Error("Non authentifié");
      // Update categorie en DB si elle existe
      if (!id.startsWith("virtual-")) {
        const { error } = await supabase
          .from("product_categories")
          .update({ name: newName })
          .eq("id", id);
        if (error) throw error;
      } else {
        // Crée une entrée pour pouvoir associer l'image
        const { error } = await supabase
          .from("product_categories")
          .insert({ name: newName, user_id: effectiveUserId, icon_emoji: "📦" });
        if (error) throw error;
      }
      // Met à jour aussi tous les produits qui utilisent ce nom
      const { error: e2 } = await supabase
        .from("products")
        .update({ category: newName })
        .eq("user_id", effectiveUserId)
        .eq("category", oldName);
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-categories", effectiveUserId] });
      qc.invalidateQueries({ queryKey: ["product-category-names", effectiveUserId] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Catégorie renommée");
      setEditingId(null);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (cat: Category) => {
      if (cat.id.startsWith("virtual-")) {
        toast.error("Cette catégorie est utilisée par des produits — modifiez d'abord les produits");
        return;
      }
      const { error } = await supabase.from("product_categories").delete().eq("id", cat.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store-categories", effectiveUserId] }),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, cat: Category) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !effectiveUserId) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error("Format non supporté (JPG, PNG, WebP)");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Image trop lourde — maximum 3 Mo");
      return;
    }

    setUploadingFor(cat.id);
    try {
      const ext = file.name.split(".").pop();
      const path = `${effectiveUserId}/categories/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: false, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      await upsertCategory.mutateAsync({ name: cat.name, image_url: publicUrl });
      toast.success("Image de catégorie enregistrée");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du téléchargement");
    } finally {
      setUploadingFor(null);
    }
  };

  const handleRemoveImage = async (cat: Category) => {
    try {
      await upsertCategory.mutateAsync({ name: cat.name, image_url: null });
      toast.success("Image retirée");
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  const handleAddCategory = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await upsertCategory.mutateAsync({ name });
      setNewName("");
      setAdding(false);
      toast.success("Catégorie ajoutée");
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Tags className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-base font-bold">Catégories de la boutique</h2>
            <p className="text-xs text-muted-foreground">Ajoutez une image pour chaque catégorie (max 3 Mo).</p>
          </div>
        </div>
        {!adding && (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)} className="gap-1.5 rounded-full flex-shrink-0">
            <Plus className="h-3.5 w-3.5" /> Nouvelle
          </Button>
        )}
      </div>

      {adding && (
        <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl">
          <Input
            placeholder="Nom de la catégorie (ex: Vêtements)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAddCategory(); }}
            className="h-10 rounded-lg"
            autoFocus
          />
          <Button size="sm" onClick={handleAddCategory} disabled={!newName.trim()} className="rounded-full">
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewName(""); }} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {allCategories.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucune catégorie. Ajoutez-en une pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allCategories.map(cat => {
            const uploading = uploadingFor === cat.id;
            const isEditing = editingId === cat.id;
            return (
              <div key={cat.id} className="relative group rounded-xl overflow-hidden border border-border bg-card">
                <div className="aspect-[16/9] bg-muted relative">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gradient-to-br from-muted to-muted-foreground/10">
                      📦
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ACCEPTED.join(",");
                        input.onchange = (ev) => handleUpload(ev as any, cat);
                        input.click();
                      }}
                      disabled={uploading}
                      className="rounded-full"
                    >
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      <span className="ml-1.5">{cat.image_url ? "Remplacer" : "Téléverser"}</span>
                    </Button>
                    {cat.image_url && (
                      <Button size="sm" variant="destructive" onClick={() => handleRemoveImage(cat)} className="rounded-full">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && editName.trim()) renameCategory.mutate({ oldName: cat.name, newName: editName.trim(), id: cat.id }); }}
                        className="h-8 text-sm rounded-lg"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { if (editName.trim()) renameCategory.mutate({ oldName: cat.name, newName: editName.trim(), id: cat.id }); }}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingId(null)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{cat.name}</p>
                        {!cat.image_url && <p className="text-[10px] text-muted-foreground">Aucune image</p>}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => deleteCategory.mutate(cat as Category)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
