import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ClientLogoUploadProps {
  currentLogoUrl?: string;
  onLogoChange: (url: string | null) => void;
}

export function ClientLogoUpload({ currentLogoUrl, onLogoChange }: ClientLogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentLogoUrl);
  const { user } = useAuth();

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      if (!user) {
        toast.error("Vous devez être connecté pour uploader un logo");
        return;
      }

      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('client-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('client-logos')
        .getPublicUrl(data.path);

      setPreview(publicUrl);
      onLogoChange(publicUrl);
      toast.success("Logo uploadé avec succès");
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error("Erreur lors de l'upload du logo");
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setPreview(undefined);
    onLogoChange(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="client-logo" className="text-xs sm:text-sm">Logo du client</Label>
      
      {preview ? (
        <div className="relative w-32 h-32 border-2 border-dashed border-border rounded-lg p-2">
          <img 
            src={preview} 
            alt="Logo client" 
            className="w-full h-full object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={removeLogo}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            id="client-logo"
            accept="image/*"
            onChange={uploadLogo}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor="client-logo"
            className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground text-center px-2">
              {uploading ? "Upload..." : "Ajouter un logo"}
            </span>
          </label>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Format: PNG, JPG, WEBP (max 5MB)
      </p>
    </div>
  );
}
