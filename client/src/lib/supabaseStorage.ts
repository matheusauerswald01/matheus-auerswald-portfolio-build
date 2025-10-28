import { getSupabaseClient, isSupabaseEnabled } from "./supabase";
import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  File as FileIcon,
} from "lucide-react";

// =====================================================
// SUPABASE STORAGE - GESTÃO DE ARQUIVOS
// =====================================================

const PORTAL_BUCKET = "portal-files";

// Interface para resultado de upload
export interface UploadResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

// Interface para resultado de download
export interface DownloadResult {
  success: boolean;
  data?: Blob;
  error?: string;
}

// Interface para informações de arquivo
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * Inicializa o bucket do portal (deve ser executado uma vez no setup)
 */
export const initializePortalBucket = async (): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) {
      console.error("Supabase não está configurado");
      return false;
    }

    // Verificar se o bucket existe
    const { data: buckets } = await client.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === PORTAL_BUCKET);

    if (!bucketExists) {
      // Criar bucket se não existir
      const { error } = await client.storage.createBucket(PORTAL_BUCKET, {
        public: false, // Arquivos privados por padrão
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          "image/*",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/*",
          "video/*",
        ],
      });

      if (error) {
        console.error("Erro ao criar bucket:", error);
        return false;
      }

      console.log("✅ Bucket portal-files criado com sucesso");
    }

    return true;
  } catch (error) {
    console.error("Erro ao inicializar bucket:", error);
    return false;
  }
};

/**
 * Faz upload de um arquivo para o Supabase Storage
 */
export const uploadFile = async (
  file: File,
  folder: string = "general",
  options?: {
    projectId?: string;
    taskId?: string;
    isPublic?: boolean;
    onProgress?: (progress: number) => void;
  }
): Promise<UploadResult> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) {
      return {
        success: false,
        error: "Supabase não está configurado",
      };
    }

    // Validar tamanho do arquivo (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "Arquivo muito grande. Tamanho máximo: 50MB",
      };
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Construir caminho do arquivo
    const filePath = `${folder}/${fileName}`;

    // Fazer upload
    const { data, error } = await client.storage
      .from(PORTAL_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Erro ao fazer upload:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Obter URL pública (se público) ou assinada
    let publicUrl: string | undefined;

    if (options?.isPublic) {
      const { data: urlData } = client.storage
        .from(PORTAL_BUCKET)
        .getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    } else {
      const { data: urlData } = await client.storage
        .from(PORTAL_BUCKET)
        .createSignedUrl(filePath, 3600); // 1 hora
      publicUrl = urlData?.signedUrl;
    }

    return {
      success: true,
      filePath: data.path,
      publicUrl,
    };
  } catch (error: any) {
    console.error("Erro ao fazer upload:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao fazer upload",
    };
  }
};

/**
 * Faz upload de múltiplos arquivos
 */
export const uploadMultipleFiles = async (
  files: File[],
  folder: string = "general",
  options?: {
    projectId?: string;
    taskId?: string;
    isPublic?: boolean;
    onProgress?: (fileIndex: number, totalFiles: number) => void;
  }
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    if (options?.onProgress) {
      options.onProgress(i + 1, files.length);
    }

    const result = await uploadFile(files[i], folder, options);
    results.push(result);
  }

  return results;
};

/**
 * Faz download de um arquivo
 */
export const downloadFile = async (
  filePath: string
): Promise<DownloadResult> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) {
      return {
        success: false,
        error: "Supabase não está configurado",
      };
    }

    const { data, error } = await client.storage
      .from(PORTAL_BUCKET)
      .download(filePath);

    if (error) {
      console.error("Erro ao fazer download:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Erro ao fazer download:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao fazer download",
    };
  }
};

/**
 * Obtém URL assinada para um arquivo (válida por tempo limitado)
 */
export const getSignedUrl = async (
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client.storage
      .from(PORTAL_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Erro ao gerar URL assinada:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Erro ao gerar URL assinada:", error);
    return null;
  }
};

/**
 * Obtém URL pública para um arquivo (para arquivos públicos)
 */
export const getPublicUrl = (filePath: string): string | null => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data } = client.storage.from(PORTAL_BUCKET).getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Erro ao obter URL pública:", error);
    return null;
  }
};

/**
 * Deleta um arquivo do storage
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client.storage
      .from(PORTAL_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error("Erro ao deletar arquivo:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return false;
  }
};

/**
 * Deleta múltiplos arquivos
 */
export const deleteMultipleFiles = async (
  filePaths: string[]
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client.storage
      .from(PORTAL_BUCKET)
      .remove(filePaths);

    if (error) {
      console.error("Erro ao deletar arquivos:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar arquivos:", error);
    return false;
  }
};

/**
 * Lista arquivos em uma pasta
 */
export const listFiles = async (
  folder: string = ""
): Promise<FileInfo[] | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client.storage
      .from(PORTAL_BUCKET)
      .list(folder, {
        limit: 1000,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("Erro ao listar arquivos:", error);
      return null;
    }

    return (
      data?.map((file) => ({
        name: file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || "unknown",
        lastModified: new Date(file.created_at).getTime(),
      })) || []
    );
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    return null;
  }
};

/**
 * Move/renomeia um arquivo
 */
export const moveFile = async (
  fromPath: string,
  toPath: string
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client.storage
      .from(PORTAL_BUCKET)
      .move(fromPath, toPath);

    if (error) {
      console.error("Erro ao mover arquivo:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao mover arquivo:", error);
    return false;
  }
};

/**
 * Copia um arquivo (para versionamento)
 */
export const copyFile = async (
  fromPath: string,
  toPath: string
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client.storage
      .from(PORTAL_BUCKET)
      .copy(fromPath, toPath);

    if (error) {
      console.error("Erro ao copiar arquivo:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao copiar arquivo:", error);
    return false;
  }
};

/**
 * Obtém informações de um arquivo
 */
export const getFileInfo = async (
  filePath: string
): Promise<FileInfo | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    // Extrair folder e filename do path
    const pathParts = filePath.split("/");
    const fileName = pathParts.pop() || "";
    const folder = pathParts.join("/");

    const { data, error } = await client.storage
      .from(PORTAL_BUCKET)
      .list(folder, {
        search: fileName,
      });

    if (error || !data || data.length === 0) {
      console.error("Erro ao obter info do arquivo:", error);
      return null;
    }

    const file = data[0];

    return {
      name: file.name,
      size: file.metadata?.size || 0,
      type: file.metadata?.mimetype || "unknown",
      lastModified: new Date(file.created_at).getTime(),
    };
  } catch (error) {
    console.error("Erro ao obter info do arquivo:", error);
    return null;
  }
};

/**
 * Gera um preview URL para imagens
 */
export const getImagePreview = async (
  filePath: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): Promise<string | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    // Por enquanto, retornar URL assinada
    // No futuro, podemos adicionar transformações de imagem
    return await getSignedUrl(filePath, 3600);
  } catch (error) {
    console.error("Erro ao gerar preview:", error);
    return null;
  }
};

/**
 * Valida tipo de arquivo
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  const fileType = file.type.toLowerCase();

  return allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      const baseType = type.replace("/*", "");
      return fileType.startsWith(baseType);
    }
    return fileType === type;
  });
};

/**
 * Formata tamanho de arquivo para exibição
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

/**
 * Obtém ícone para tipo de arquivo
 */
export const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType.includes("pdf")) return FileText;
  if (mimeType.includes("word") || mimeType.includes("document")) return FileText;
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return FileSpreadsheet;
  if (mimeType.includes("zip") || mimeType.includes("rar")) return FileArchive;
  if (mimeType.startsWith("text/")) return FileText;

  return FileIcon;
};
