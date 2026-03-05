import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ImageCropUploadProps {
  currentImageUrl?: string | null;
  onImageUploaded: (url: string | null) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropUpload({ currentImageUrl, onImageUploaded }: ImageCropUploadProps) {
  const { user } = useAuth();
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 5 Mo)");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format non supporté (JPG, PNG, WEBP uniquement)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImgSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  const getCroppedBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const image = imgRef.current;
      if (!image || !crop) return reject("No image/crop");
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelCrop = {
        x: (crop.x / 100) * image.width * scaleX,
        y: (crop.y / 100) * image.height * scaleY,
        width: (crop.width / 100) * image.width * scaleX,
        height: (crop.height / 100) * image.height * scaleY,
      };
      const size = Math.min(pixelCrop.width, pixelCrop.height, 800);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No ctx");
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, size, size);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject("No blob"), "image/webp", 0.85);
    });
  };

  const handleUpload = async () => {
    if (!user) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob();
      const fileName = `${user.id}/${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, blob, { contentType: "image/webp", upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      onImageUploaded(data.publicUrl);
      setImgSrc("");
      toast.success("Image uploadée !");
    } catch (err: any) {
      toast.error(err.message || "Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageUploaded(null);
    setImgSrc("");
  };

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onSelectFile} />

      {imgSrc ? (
        <div className="space-y-3">
          <div className="border border-border rounded-lg overflow-hidden bg-muted max-h-64 flex items-center justify-center">
            <ReactCrop crop={crop} onChange={(_, pc) => setCrop(pc)} aspect={1} circularCrop={false} className="max-h-64">
              <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} className="max-h-64" alt="Recadrage" />
            </ReactCrop>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleUpload} disabled={uploading} className="flex-1 gap-1">
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {uploading ? "Upload..." : "Valider"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setImgSrc("")}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : currentImageUrl ? (
        <div className="relative">
          <img src={currentImageUrl} alt="Produit" className="h-20 w-20 rounded-lg object-cover border border-border" />
          <div className="flex gap-2 mt-2">
            <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} className="gap-1 text-xs">
              <Camera className="h-3 w-3" /> Changer
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={handleRemoveImage} className="text-xs text-destructive">
              <X className="h-3 w-3" /> Retirer
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="gap-2 w-full h-16 border-dashed">
          <Camera className="h-4 w-4" />
          <span className="text-sm">Ajouter une photo du produit</span>
        </Button>
      )}
    </div>
  );
}
