import { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Upload as UploadIcon, X } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FileUpload from "@/components/portal/FileUpload";
import FileManager from "@/components/portal/FileManager";
import { usePortalAuthContext } from "@/contexts/PortalAuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPortalClientByUserId, getPortalProjects } from "@/lib/supabase";
import type { PortalProject } from "@/lib/supabase";
import { useEffect } from "react";

export default function PortalFiles() {
  const { user } = usePortalAuthContext();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [user?.id]);

  const fetchProjects = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const client = await getPortalClientByUserId(user.id);
      if (!client) return;

      const projectsData = await getPortalProjects(client.id);
      setProjects(projectsData);

      // Selecionar primeiro projeto automaticamente
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0].id!);
      }
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
                <FolderOpen className="h-8 w-8" />
                Meus Arquivos
              </h1>
              <p className="text-muted-foreground">
                Gerencie os arquivos dos seus projetos
              </p>
            </div>

            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <UploadIcon className="mr-2 h-4 w-4" />
              Enviar Arquivo
            </Button>
          </div>
        </motion.div>

        {/* Project Selector */}
        {projects.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Projeto:</label>
                <Select
                  value={selectedProject || undefined}
                  onValueChange={setSelectedProject}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id!}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </motion.div>
        )}

        {/* File Manager */}
        {selectedProject ? (
          <motion.div
            key={selectedProject}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FileManager
              projectId={selectedProject}
              onFileDelete={() => {
                // Refresh se necessário
              }}
            />
          </motion.div>
        ) : (
          <Card className="p-12 text-center">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum projeto selecionado</h3>
            <p className="text-muted-foreground">
              {projects.length === 0
                ? "Você ainda não tem projetos"
                : "Selecione um projeto para ver os arquivos"}
            </p>
          </Card>
        )}

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar Arquivos</DialogTitle>
              <DialogDescription>
                Arraste arquivos para fazer upload ou clique para selecionar
              </DialogDescription>
            </DialogHeader>

            {selectedProject ? (
              <FileUpload
                projectId={selectedProject}
                onUploadComplete={() => {
                  // Fechar dialog após upload
                  setTimeout(() => {
                    setIsUploadDialogOpen(false);
                  }, 1000);
                }}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Selecione um projeto primeiro
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
}


