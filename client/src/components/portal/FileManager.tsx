import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Trash2,
  Eye,
  MoreVertical,
  Search,
  Grid3X3,
  List,
  Filter,
  Calendar,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPortalFiles,
  deletePortalFile,
  type PortalFile,
} from "@/lib/supabase";
import {
  getPublicUrl,
  getSignedUrl,
  formatFileSize,
  getFileIcon,
} from "@/lib/supabaseStorage";
import { formatDate, formatRelativeDate } from "@/lib/portalUtils";
import { toast } from "sonner";

interface FileManagerProps {
  projectId: string;
  taskId?: string;
  onFileDelete?: (fileId: string) => void;
  showUploadButton?: boolean;
}

type ViewMode = "grid" | "list";
type SortBy = "name" | "date" | "size";

export default function FileManager({
  projectId,
  taskId,
  onFileDelete,
  showUploadButton = true,
}: FileManagerProps) {
  const [files, setFiles] = useState<PortalFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<PortalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");

  useEffect(() => {
    fetchFiles();
  }, [projectId, taskId]);

  useEffect(() => {
    filterAndSortFiles();
  }, [files, searchTerm, sortBy]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const filesData = await getPortalFiles(
        taskId || projectId,
        taskId ? "task" : "project"
      );
      setFiles(filesData);
    } catch (error) {
      console.error("Erro ao buscar arquivos:", error);
      toast.error("Erro ao carregar arquivos");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortFiles = () => {
    let filtered = files;

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter((file) =>
        file.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.original_filename.localeCompare(b.original_filename);
        case "size":
          return (b.file_size || 0) - (a.file_size || 0);
        case "date":
        default:
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
      }
    });

    setFilteredFiles(filtered);
  };

  const handleDownload = async (file: PortalFile) => {
    try {
      const { url, error } = await getSignedUrl("portal-files", file.storage_path, 60);

      if (error || !url) {
        toast.error("Erro ao gerar link de download");
        return;
      }

      // Abrir em nova aba ou fazer download
      const link = document.createElement("a");
      link.href = url;
      link.download = file.original_filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Baixando ${file.original_filename}`);
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast.error("Erro ao baixar arquivo");
    }
  };

  const handleDelete = async (file: PortalFile) => {
    if (!confirm(`Tem certeza que deseja excluir "${file.original_filename}"?`)) {
      return;
    }

    try {
      const success = await deletePortalFile(file.id!);

      if (!success) {
        toast.error("Erro ao excluir arquivo");
        return;
      }

      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast.success("Arquivo excluído com sucesso");

      if (onFileDelete) {
        onFileDelete(file.id!);
      }
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      toast.error("Erro ao excluir arquivo");
    }
  };

  const handleView = async (file: PortalFile) => {
    // Para imagens e PDFs, abrir preview
    if (
      file.mime_type?.startsWith("image/") ||
      file.mime_type === "application/pdf"
    ) {
      const { url } = await getSignedUrl("portal-files", file.storage_path, 60);
      if (url) {
        const newWindow = window.open(url, "_blank", "noopener,noreferrer");
        if (newWindow) {
          newWindow.opener = null;
        }
      }
    } else {
      // Para outros tipos, fazer download
      handleDownload(file);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Arquivos ({files.length})
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={fetchFiles}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v: SortBy) => setSortBy(v)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Mais recentes</SelectItem>
              <SelectItem value="name">Nome (A-Z)</SelectItem>
              <SelectItem value="size">Tamanho</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Files Grid/List */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm
                ? "Nenhum arquivo encontrado"
                : "Nenhum arquivo ainda"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file, index) => (
              <FileCardGrid
                key={file.id}
                file={file}
                index={index}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file, index) => (
              <FileCardList
                key={file.id}
                file={file}
                index={index}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Grid View Card
function FileCardGrid({
  file,
  index,
  onDownload,
  onDelete,
  onView,
}: {
  file: PortalFile;
  index: number;
  onDownload: (file: PortalFile) => void;
  onDelete: (file: PortalFile) => void;
  onView: (file: PortalFile) => void;
}) {
  const Icon = getFileIcon(file.mime_type || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            {/* Icon & Menu */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(file)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload(file)}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(file)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Info */}
            <div>
              <p
                className="font-medium text-sm truncate mb-1"
                title={file.original_filename}
              >
                {file.original_filename}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.file_size || 0)}
              </p>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatRelativeDate(file.created_at!)}</span>
            </div>

            {/* Description */}
            {file.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {file.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// List View Card
function FileCardList({
  file,
  index,
  onDownload,
  onDelete,
  onView,
}: {
  file: PortalFile;
  index: number;
  onDownload: (file: PortalFile) => void;
  onDelete: (file: PortalFile) => void;
  onView: (file: PortalFile) => void;
}) {
  const Icon = getFileIcon(file.mime_type || "");

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate mb-1" title={file.original_filename}>
                {file.original_filename}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatFileSize(file.file_size || 0)}</span>
                <span>•</span>
                <span>{formatRelativeDate(file.created_at!)}</span>
                {file.description && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">
                      {file.description}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(file);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(file);
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

