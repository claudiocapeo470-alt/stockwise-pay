import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadProductImage } from "@/lib/uploadProductImage";

interface ProductImageInputProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  /** Notifie le parent pendant l'upload (pour désactiver la sauvegarde) */
  onUploadingChange?: (uploading: boolean) => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ProductImageInput({ value, onChange, onUploadingChange }: ProductImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const setBusy = (v: boolean) => {
    setUploading(v);
    onUploadingChange?.(v);
  };

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error("Format non supporté (JPG, PNG, WEBP, GIF)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 10 Mo)");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setBusy(true);
    try {
      const { url } = await uploadProductImage(file);
      onChange(url);
      toast.success("Image téléversée");
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'upload");
      setPreview(null);
    } finally {
      setBusy(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  const shown = uploading ? preview : value || preview;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleSelect}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          className="relative h-20 w-20 rounded-xl border border-dashed border-border overflow-hidden bg-muted flex items-center justify-center shrink-0"
        >
          {shown ? (
            <img src={shown} alt="Aperçu du produit" className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-5 w-5 text-muted-foreground" />
          )}
          {uploading && (
            <span className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </span>
          )}
        </button>

        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 text-xs rounded-xl"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
            {uploading ? "Envoi en cours..." : value ? "Changer l'image" : "Choisir une image"}
          </Button>
          {value && !uploading && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="gap-1 text-xs text-destructive"
              onClick={() => { onChange(null); setPreview(null); }}
            >
              <X className="h-3 w-3" /> Retirer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
