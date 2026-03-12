import { useRef, useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Bold, Italic, Underline, List, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5 Mo"); return; }

    setUploading(true);
    try {
      const fileName = `${user.id}/desc-${Date.now()}.webp`;
      const img = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const maxSize = 600;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(b => b ? resolve(b) : reject('fail'), 'image/webp', 0.8)
      );
      const { error } = await supabase.storage.from("product-images").upload(fileName, blob, { contentType: "image/webp" });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      execCommand('insertHTML', `<img src="${data.publicUrl}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`);
    } catch {
      toast.error("Erreur upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1 border border-border rounded-t-lg bg-muted/50">
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('bold')} title="Gras">
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('italic')} title="Italique">
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('underline')} title="Souligné">
          <Underline className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('insertUnorderedList')} title="Liste">
          <List className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Insérer image">
          <ImageIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[120px] max-h-[300px] overflow-y-auto p-3 border border-border border-t-0 rounded-b-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
        data-placeholder={placeholder || "Tapez votre description ici..."}
        style={{ 
          wordBreak: 'break-word',
        }}
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
