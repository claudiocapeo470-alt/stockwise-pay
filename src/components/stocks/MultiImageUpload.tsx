import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function MultiImageUpload({ images, onImagesChange, maxImages = 5 }: MultiImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;

    const remaining = maxImages - images.length;
    if (files.length > remaining) {
      toast.error(`Maximum ${maxImages} images. Vous pouvez encore en ajouter ${remaining}.`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: trop volumineux (max 5 Mo)`);
        continue;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name}: format non supporté`);
        continue;
      }

      try {
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
        
        // Create canvas for resize
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height, 800);
        const scale = size / Math.max(img.width, img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(b => b ? resolve(b) : reject('No blob'), 'image/webp', 0.85);
        });

        const { error } = await supabase.storage.from("product-images").upload(fileName, blob, { contentType: "image/webp" });
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      } catch (err: any) {
        toast.error(`Erreur: ${err.message || 'Upload échoué'}`);
      }
    }

    if (newUrls.length > 0) {
      onImagesChange([...images, ...newUrls]);
      toast.success(`${newUrls.length} image(s) ajoutée(s)`);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Image grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
            <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Principal</span>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 transition-colors"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Plus className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} images • JPG, PNG, WEBP • Max 5 Mo
      </p>
    </div>
  );
}
