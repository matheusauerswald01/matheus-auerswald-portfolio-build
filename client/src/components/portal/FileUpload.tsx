import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  File,
  FileText,
  Image as ImageIcon,
  FileVideo,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile, getFileIcon } from "@/lib/supabaseStorage";
import { createPortalFile, type PortalFile } from "@/lib/supabase";
import { toast } from "sonner";

interface FileUploadProps {
  projectId: string;
  taskId?: string;
  onUploadComplete?: (file: PortalFile) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
  description?: string;
}

export default function FileUpload({
  projectId,
  taskId,
  onUploadComplete,
  maxSizeMB = 50,
  allowedTypes = [],
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<
    Map<string, UploadingFile>
  >(new Map());
  const [showDescriptionFor, setShowDescriptionFor] = useState<string | null>(
    null
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [projectId, taskId]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        handleFiles(files);
      }
    },
    [projectId, taskId]
  );

  const handleFiles = async (files: File[]) => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes

    for (const file of files) {
      const fileId = `${file.name}-${Date.now()}`;

      // Validações
      if (file.size > maxSize) {
        toast.error(
          `Arquivo ${file.name} é muito grande. Máximo: ${maxSizeMB}MB`
        );
        continue;
      }

      if (
        allowedTypes.length > 0 &&
        !allowedTypes.includes(file.type)
      ) {
        toast.error(`Tipo de arquivo ${file.name} não permitido`);
        continue;
      }

      // Adicionar à lista de uploads
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          file,
          progress: 0,
          status: "uploading",
        });
        return newMap;
      });

      // Fazer upload
      await uploadFileToStorage(file, fileId);
    }
  };

  const uploadFileToStorage = async (file: File, fileId: string) => {
    try {
      // Gerar caminho no storage
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = taskId
        ? `projects/${projectId}/tasks/${taskId}/${timestamp}_${sanitizedFileName}`
        : `projects/${projectId}/${timestamp}_${sanitizedFileName}`;

      // Upload para Supabase Storage
      const { path, error: uploadError } = await uploadFile(
        "portal-files",
        storagePath,
        file,
        {
          cacheControl: "3600",
          upsert: false,
        }
      );

      if (uploadError || !path) {
        throw new Error(uploadError || "Erro ao fazer upload");
      }

      // Atualizar progresso
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(fileId);
        if (current) {
          newMap.set(fileId, { ...current, progress: 100 });
        }
        return newMap;
      });

      // Criar registro no banco
      const fileData: PortalFile = {
        project_id: projectId,
        task_id: taskId,
        filename: sanitizedFileName,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: path,
        description:
          uploadingFiles.get(fileId)?.description || undefined,
      };

      const createdFile = await createPortalFile(fileData);

      if (!createdFile) {
        throw new Error("Erro ao criar registro do arquivo");
      }

      // Sucesso!
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(fileId);
        if (current) {
          newMap.set(fileId, { ...current, status: "success" });
        }
        return newMap;
      });

      toast.success(`${file.name} enviado com sucesso!`);

      if (onUploadComplete) {
        onUploadComplete(createdFile);
      }

      // Remover da lista após 2 segundos
      setTimeout(() => {
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }, 2000);
    } catch (error: any) {
      console.error("Erro no upload:", error);

      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(fileId);
        if (current) {
          newMap.set(fileId, {
            ...current,
            status: "error",
            error: error.message,
          });
        }
        return newMap;
      });

      toast.error(`Erro ao enviar ${file.name}: ${error.message}`);
    }
  };

  const updateFileDescription = (fileId: string, description: string) => {
    setUploadingFiles((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(fileId);
      if (current) {
        newMap.set(fileId, { ...current, description });
      }
      return newMap;
    });
  };

  const removeFile = (fileId: string) => {
    setUploadingFiles((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />

        <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>

          <div className="text-center">
            <p className="text-lg font-medium mb-1">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-sm text-muted-foreground">
              Máximo {maxSizeMB}MB por arquivo
            </p>
          </div>

          <Button
            variant="outline"
            className="pointer-events-auto"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Selecionar Arquivos
          </Button>
        </div>
      </motion.div>

      {/* Uploading Files */}
      <AnimatePresence>
        {Array.from(uploadingFiles.entries()).map(([fileId, uploadFile]) => (
          <motion.div
            key={fileId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    uploadFile.status === "success"
                      ? "bg-green-500/10"
                      : uploadFile.status === "error"
                      ? "bg-red-500/10"
                      : "bg-blue-500/10"
                  }`}
                >
                  {uploadFile.status === "uploading" && (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  )}
                  {uploadFile.status === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {uploadFile.status === "error" && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    {uploadFile.status === "error" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(fileId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Progress */}
                  {uploadFile.status === "uploading" && (
                    <Progress value={uploadFile.progress} className="h-1" />
                  )}

                  {/* Error */}
                  {uploadFile.status === "error" && (
                    <p className="text-xs text-red-500 mt-1">
                      {uploadFile.error}
                    </p>
                  )}

                  {/* Success */}
                  {uploadFile.status === "success" && (
                    <p className="text-xs text-green-600 mt-1">
                      Upload concluído!
                    </p>
                  )}

                  {/* Description (optional) */}
                  {showDescriptionFor === fileId && (
                    <div className="mt-3">
                      <Label htmlFor={`desc-${fileId}`} className="text-xs">
                        Descrição (opcional)
                      </Label>
                      <Textarea
                        id={`desc-${fileId}`}
                        placeholder="Adicione uma descrição para este arquivo..."
                        className="mt-1"
                        rows={2}
                        value={uploadFile.description || ""}
                        onChange={(e) =>
                          updateFileDescription(fileId, e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}


