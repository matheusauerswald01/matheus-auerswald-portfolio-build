import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface MediaUploadProps {
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  label?: string;
  accept?: string;
}

export default function MediaUpload({
  currentUrl,
  onUploadComplete,
  label = "Imagem ou Vídeo",
  accept = "image/*,video/*",
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentUrl || "");
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Formato inválido", {
        description: "Por favor, selecione uma imagem ou vídeo.",
      });
      return;
    }

    // Validar tamanho (40MB)
    const maxSize = 40 * 1024 * 1024; // 40MB
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande", {
        description: "O arquivo deve ter no máximo 40MB.",
      });
      return;
    }

    setFileType(isImage ? "image" : "video");

    // Criar preview local
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // Upload para Supabase Storage
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      // Simular progresso (Supabase não fornece progresso real)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload para o bucket
      const { data, error } = await supabase.storage
        .from("portfolio-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw error;
      }

      // Obter URL pública do arquivo
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio-media").getPublicUrl(filePath);

      // Notificar componente pai
      onUploadComplete(publicUrl);

      toast.success("Upload concluído!", {
        description: "Arquivo enviado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error("Erro no upload", {
        description: error.message || "Não foi possível enviar o arquivo.",
      });
      setPreview(currentUrl || "");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview("");
    setFileType(null);
    onUploadComplete("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {/* Preview */}
      {preview && (
        <div className="relative rounded-lg overflow-hidden bg-muted border">
          {fileType === "image" ||
          preview.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
          ) : fileType === "video" || preview.match(/\.(mp4|webm|mov)$/i) ? (
            <video
              src={preview}
              controls
              preload="metadata"
              crossOrigin="anonymous"
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {!uploading && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Enviando... {progress}%
          </p>
        </div>
      )}

      {/* Upload Button */}
      {!preview && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Enviando arquivo...
                </p>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  <Video className="w-10 h-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">
                    Arraste e solte ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Imagens ou vídeos (máx. 40MB)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleButtonClick}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Change Button */}
      {preview && !uploading && (
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Trocar Arquivo
        </Button>
      )}
    </div>
  );
}
