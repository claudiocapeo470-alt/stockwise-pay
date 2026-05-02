import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Check, Star, Trash2, Plus, User, AlertTriangle, EyeOff } from "lucide-react";
import { MultiImageUpload } from "@/components/stocks/MultiImageUpload";
import { RichTextEditor } from "@/components/stocks/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ImageCropUpload } from "@/components/stocks/ImageCropUpload";

interface StoreProductEditDialogProps {
  storeProduct: any;
  product: any;
  storeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function StoreProductEditDialog({ storeProduct, product, storeId, open, onOpenChange, onSaved }: StoreProductEditDialogProps) {
  const { user, isEmployee, memberInfo } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const effectiveUserId = isEmployee ? (memberInfo?.owner_id || product?.user_id) : user?.id;

  // Step 1: Basic info
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price || 0);
  const [quantity, setQuantity] = useState(product?.quantity || 0);
  const [category, setCategory] = useState(product?.category || "");
  const [onlinePrice, setOnlinePrice] = useState(storeProduct?.online_price || product?.price || 0);
  const [isFeatured, setIsFeatured] = useState(storeProduct?.is_featured || false);
  const [isActive, setIsActive] = useState(storeProduct?.is_active !== false);
  const [forceOutOfStock, setForceOutOfStock] = useState(storeProduct?.force_out_of_stock || false);

  // Step 2: Images
  const [images, setImages] = useState<string[]>([]);

  // Step 3: Rich description
  const [onlineDescription, setOnlineDescription] = useState(storeProduct?.online_description || "");

  // Step 4: Reviews/Testimonials
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ customer_name: "", comment: "", rating: 5, photo_url: "" });

  // Load images & reviews
  useEffect(() => {
    if (!product?.id || !open) return;
    // Load product images
    supabase.from('product_images').select('*').eq('product_id', product.id).order('sort_order').then(({ data }) => {
      if (data?.length) {
        setImages(data.map(d => d.image_url));
      } else if (product.image_url) {
        setImages([product.image_url]);
      } else {
        setImages([]);
      }
    });
    // Load reviews for this product
    supabase.from('store_reviews').select('*').eq('store_id', storeId).eq('product_id', product.id).order('created_at', { ascending: false }).then(({ data }) => {
      setReviews(data || []);
    });
  }, [product?.id, storeId, open]);

  useEffect(() => {
    if (storeProduct && open) {
      setName(product?.name || "");
      setPrice(product?.price || 0);
      setQuantity(product?.quantity || 0);
      setCategory(product?.category || "");
      setOnlinePrice(storeProduct.online_price || product?.price || 0);
      setIsFeatured(storeProduct.is_featured || false);
      setIsActive(storeProduct.is_active !== false);
      setForceOutOfStock(storeProduct.force_out_of_stock || false);
      setOnlineDescription(storeProduct.online_description || "");
      setStep(1);
    }
  }, [storeProduct, product, open]);

  const handleSave = async () => {
    if (!user || !effectiveUserId || !product) return;
    setSaving(true);
    try {
      // Update store_products
      await (supabase.from('store_products') as any).update({
        online_price: onlinePrice,
        is_featured: isFeatured,
        is_active: isActive,
        force_out_of_stock: forceOutOfStock,
        online_description: onlineDescription,
      }).eq('store_id', storeId).eq('product_id', product.id);

      // Update main product details
      const { error: productError } = await supabase.from('products').update({
        name: name.trim(),
        price,
        quantity,
        category: category.trim() || null,
        description: onlineDescription,
        image_url: images[0] || null,
      }).eq('id', product.id);
      if (productError) throw productError;

      // Sync product_images table
      await supabase.from('product_images').delete().eq('product_id', product.id);
      if (images.length > 0) {
        const rows = images.map((url, i) => ({
          product_id: product.id,
          user_id: effectiveUserId,
          image_url: url,
          sort_order: i,
        }));
        await supabase.from('product_images').insert(rows);
      }

      toast.success("Produit boutique mis à jour");
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleAddReview = async () => {
    if (!newReview.customer_name.trim() || !newReview.comment.trim()) {
      toast.error("Nom et commentaire requis");
      return;
    }
    try {
      const { data, error } = await supabase.from('store_reviews').insert({
        store_id: storeId,
        product_id: product.id,
        customer_name: newReview.customer_name,
        comment: newReview.comment,
        rating: newReview.rating,
        is_approved: true,
      }).select().single();
      if (error) throw error;
      setReviews(prev => [data, ...prev]);
      setNewReview({ customer_name: "", comment: "", rating: 5, photo_url: "" });
      toast.success("Avis ajouté");
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await supabase.from('store_reviews').delete().eq('id', reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success("Avis supprimé");
    } catch {
      toast.error("Erreur");
    }
  };

  const totalSteps = 4;

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1.5 mb-4">
      {[1, 2, 3, 4].map(s => (
        <div key={s} className="flex items-center gap-1.5">
          <button
            onClick={() => setStep(s)}
            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              s < step ? "bg-success text-success-foreground" : s === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {s < step ? <Check className="h-3 w-3" /> : s}
          </button>
          {s < totalSteps && <div className={`w-5 h-0.5 ${s < step ? "bg-success" : "bg-muted"}`} />}
        </div>
      ))}
    </div>
  );

  const stepLabels = ["Infos", "Photos", "Description", "Avis"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Modifier — {product?.name}
          </DialogTitle>
          <DialogDescription>Étape {step}: {stepLabels[step - 1]}</DialogDescription>
        </DialogHeader>
        <StepIndicator />

        <div className="space-y-4 min-h-[200px]">
          {/* Step 1: Basic info */}
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <Label>Nom du produit</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nom affiché dans la boutique" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Prix stock (FCFA)</Label>
                  <Input type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Catégorie</Label>
                  <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ex: Chaussures" />
                </div>
              </div>
              <div>
                <Label>Prix boutique (FCFA)</Label>
                <Input type="number" min="0" value={onlinePrice} onChange={e => setOnlinePrice(Number(e.target.value))} />
                <p className="text-xs text-muted-foreground mt-1">Prix original: {product?.price?.toLocaleString()} FCFA</p>
              </div>
              <div className="space-y-1.5">
                <Label>Quantité actuelle en stock</Label>
                <Input type="number" min="0" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Produit vedette</Label>
                  <p className="text-xs text-muted-foreground">Mis en avant dans la boutique</p>
                </div>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Produit visible</Label>
                  <p className="text-xs text-muted-foreground">Active ou masque ce produit en boutique</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <Label>Forcer la rupture de stock</Label>
                    <p className="text-xs text-muted-foreground">Le produit reste visible mais impossible à commander</p>
                  </div>
                </div>
                <Switch checked={forceOutOfStock} onCheckedChange={setForceOutOfStock} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>État boutique</Label>
                  <p className="text-xs text-muted-foreground">Aperçu du statut client</p>
                </div>
                <Badge variant={!isActive ? "secondary" : forceOutOfStock || quantity <= 0 ? "destructive" : "default"} className="gap-1">
                  {!isActive && <EyeOff className="h-3 w-3" />}
                  {!isActive ? "Masqué" : forceOutOfStock || quantity <= 0 ? "Rupture" : `${quantity} unités`}
                </Badge>
              </div>
            </>
          )}

          {/* Step 2: Multiple images */}
          {step === 2 && (
            <>
              <Label>Photos du produit</Label>
              <MultiImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={8}
              />
              <p className="text-xs text-muted-foreground">La première image sera la photo principale affichée dans la boutique.</p>
            </>
          )}

          {/* Step 3: Rich description */}
          {step === 3 && (
            <>
              <Label>Description pour la boutique en ligne</Label>
              <RichTextEditor
                value={onlineDescription}
                onChange={setOnlineDescription}
                placeholder="Décrivez votre produit avec du texte riche, des images, du gras, de l'italique..."
              />
              <p className="text-xs text-muted-foreground">Utilisez la barre d'outils pour formater: gras, italique, souligné, listes, images.</p>
            </>
          )}

          {/* Step 4: Reviews/Testimonials */}
          {step === 4 && (
            <>
              <Label>Avis & Témoignages</Label>
              
              {/* Add new review */}
              <div className="p-3 border border-border rounded-lg space-y-3 bg-muted/30">
                <p className="text-sm font-medium">Ajouter un avis</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Nom du client *</Label>
                    <Input
                      value={newReview.customer_name}
                      onChange={e => setNewReview(p => ({ ...p, customer_name: e.target.value }))}
                      placeholder="Jean Dupont"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Note</Label>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} type="button" onClick={() => setNewReview(p => ({ ...p, rating: n }))}>
                          <Star className={`h-4 w-4 ${n <= newReview.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Commentaire *</Label>
                  <Textarea
                    value={newReview.comment}
                    onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))}
                    placeholder="Super produit, je recommande..."
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <Button size="sm" onClick={handleAddReview} className="gap-1">
                  <Plus className="h-3 w-3" /> Ajouter l'avis
                </Button>
              </div>

              <Separator />

              {/* Existing reviews */}
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun avis pour ce produit</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="flex items-start gap-3 p-2 border border-border rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{review.customer_name}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star key={n} className={`h-3 w-3 ${n <= (review.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{review.comment}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleDeleteReview(review.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between pt-3 border-t border-border">
          <div>
            {step > 1 ? (
              <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)} className="gap-1">
                <ChevronLeft className="h-4 w-4" /> Précédent
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Fermer</Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < totalSteps ? (
              <Button size="sm" onClick={() => setStep(s => s + 1)} className="gap-1">
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Sauvegarde..." : "💾 Enregistrer tout"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
