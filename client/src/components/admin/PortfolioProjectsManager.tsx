import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, X, ExternalLink, Github } from "lucide-react";
import {
  usePortfolioProjects,
  useCreatePortfolioProject,
  useUpdatePortfolioProject,
  useDeletePortfolioProject,
  type PortfolioProject,
} from "@/hooks/usePortfolioProjects";
import MediaUpload from "./MediaUpload";

const availableColors = [
  { name: "Azul", value: "from-blue-500 to-cyan-500" },
  { name: "Roxo", value: "from-purple-500 to-pink-500" },
  { name: "Laranja", value: "from-orange-500 to-red-500" },
  { name: "Verde", value: "from-green-500 to-emerald-500" },
  { name: "Rosa", value: "from-pink-500 to-rose-500" },
  { name: "Índigo", value: "from-indigo-500 to-purple-500" },
];

export default function PortfolioProjectsManager() {
  const { data: projects = [], isLoading } = usePortfolioProjects(false);
  const createProject = useCreatePortfolioProject();
  const updateProject = useUpdatePortfolioProject();
  const deleteProject = useDeletePortfolioProject();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<PortfolioProject>>({
    title: "",
    description: "",
    image_url: "",
    tags: [],
    demo_url: "",
    github_url: "",
    color_gradient: "from-blue-500 to-cyan-500",
    order_index: 0,
    is_featured: false,
    is_published: true,
  });
  const [newTag, setNewTag] = useState("");

  const handleOpenDialog = (project?: PortfolioProject) => {
    if (project) {
      setEditingProject(project);
      setFormData(project);
    } else {
      setEditingProject(null);
      setFormData({
        title: "",
        description: "",
        image_url: "",
        tags: [],
        demo_url: "",
        github_url: "",
        color_gradient: "from-blue-500 to-cyan-500",
        order_index: projects.length,
        is_featured: false,
        is_published: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
    setNewTag("");
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      return;
    }

    try {
      if (editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id!,
          ...formData,
        });
      } else {
        await createProject.mutateAsync(formData as any);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este projeto?")) {
      await deleteProject.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando projetos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projetos do Portfólio</h2>
          <p className="text-muted-foreground">
            Gerencie os projetos exibidos no seu portfólio
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="group hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-1">
                  {project.title}
                </CardTitle>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenDialog(project)}
                    className="h-8 w-8"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(project.id!)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Media (Image or Video) */}
              {project.image_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  {project.image_url.match(/\.(mp4|webm|mov)$/i) ? (
                    <video
                      src={project.image_url}
                      controls
                      preload="metadata"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Links */}
              <div className="flex items-center gap-2">
                {project.demo_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="flex-1"
                  >
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Demo
                    </a>
                  </Button>
                )}
                {project.github_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="flex-1"
                  >
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-3 h-3 mr-1" />
                      GitHub
                    </a>
                  </Button>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div className="flex gap-2">
                  {project.is_featured && (
                    <Badge variant="default" className="text-xs">
                      Destaque
                    </Badge>
                  )}
                  <Badge
                    variant={project.is_published ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {project.is_published ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
                <span>Ordem: {project.order_index}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Nenhum projeto cadastrado ainda.
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Projeto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Editar Projeto" : "Novo Projeto"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do projeto do portfólio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nome do projeto"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva o projeto..."
                rows={3}
              />
            </div>

            {/* Upload de Mídia */}
            <MediaUpload
              currentUrl={formData.image_url}
              onUploadComplete={(url) =>
                setFormData({ ...formData, image_url: url })
              }
              label="Imagem ou Vídeo do Projeto"
            />

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tecnologias/Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddTag())
                  }
                  placeholder="Ex: React, Node.js..."
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  Adicionar
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* URLs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demo_url">URL Demo</Label>
                <Input
                  id="demo_url"
                  value={formData.demo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, demo_url: e.target.value })
                  }
                  placeholder="https://demo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url">URL GitHub</Label>
                <Input
                  id="github_url"
                  value={formData.github_url}
                  onChange={(e) =>
                    setFormData({ ...formData, github_url: e.target.value })
                  }
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            {/* Cor do Gradiente */}
            <div className="space-y-2">
              <Label htmlFor="color">Cor do Gradiente</Label>
              <Select
                value={formData.color_gradient}
                onValueChange={(value) =>
                  setFormData({ ...formData, color_gradient: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-4 rounded bg-gradient-to-r ${color.value}`}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordem */}
            <div className="space-y-2">
              <Label htmlFor="order">Ordem de Exibição</Label>
              <Input
                id="order"
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order_index: parseInt(e.target.value),
                  })
                }
                min={0}
              />
            </div>

            {/* Switches */}
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked })
                  }
                />
                <Label htmlFor="featured">Projeto em Destaque</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_published: checked })
                  }
                />
                <Label htmlFor="published">Publicado</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.description}
            >
              {editingProject ? "Salvar Alterações" : "Criar Projeto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
