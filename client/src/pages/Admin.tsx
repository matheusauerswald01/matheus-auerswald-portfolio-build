import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  BarChart3,
  FolderOpen,
  LogOut,
  Activity,
  MessageSquare,
  Database,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import AdminAuth from "@/components/AdminAuth";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import MetaPixelManager from "@/components/MetaPixelManager";
import ContactFormManager from "@/components/ContactFormManager";
import SupabaseConfig from "@/components/SupabaseConfig";
import PortalClientManagement from "@/components/PortalClientManagement";
import PortfolioProjectsManager from "@/components/admin/PortfolioProjectsManager";

// Tipo para os projetos
type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
  github: string;
  color: string;
};

// Projetos iniciais (mesmos do ProjectsSection)
const initialProjects = [
  {
    id: "1",
    title: "E-commerce Platform",
    description:
      "Plataforma de e-commerce completa com carrinho de compras, pagamento integrado e painel administrativo.",
    image:
      "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=500&h=300&fit=crop",
    tags: ["Next.js", "Stripe", "PostgreSQL", "Tailwind CSS"],
    link: "#",
    github: "#",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "2",
    title: "SaaS Dashboard",
    description:
      "Dashboard analítico em tempo real com gráficos interativos, autenticação OAuth e gerenciamento de usuários.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
    tags: ["React", "Node.js", "Chart.js", "MongoDB"],
    link: "#",
    github: "#",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "3",
    title: "Portfolio Website",
    description:
      "Site portfolio responsivo com animações fluidas, SEO otimizado e performance excelente.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
    tags: ["Next.js", "Framer Motion", "Tailwind CSS"],
    link: "#",
    github: "#",
    color: "from-orange-500 to-red-500",
  },
];

// Cores disponíveis para os projetos
const availableColors = [
  { name: "Azul", value: "from-blue-500 to-cyan-500" },
  { name: "Roxo", value: "from-purple-500 to-pink-500" },
  { name: "Laranja", value: "from-orange-500 to-red-500" },
  { name: "Verde", value: "from-green-500 to-emerald-500" },
  { name: "Rosa", value: "from-pink-500 to-rose-500" },
  { name: "Índigo", value: "from-indigo-500 to-purple-500" },
];

export default function Admin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Omit<Project, "id">>({
    title: "",
    description: "",
    image: "",
    tags: [],
    link: "",
    github: "",
    color: "from-blue-500 to-cyan-500",
  });
  const [newTag, setNewTag] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar projetos do localStorage ao iniciar
  useEffect(() => {
    const savedProjects = localStorage.getItem("portfolio-projects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Usar projetos iniciais se não houver dados salvos
      setProjects(initialProjects);
      localStorage.setItem(
        "portfolio-projects",
        JSON.stringify(initialProjects)
      );
    }
  }, []);

  // Função para salvar projetos no localStorage
  const saveProjectsToStorage = (updatedProjects: Project[]) => {
    localStorage.setItem("portfolio-projects", JSON.stringify(updatedProjects));
  };

  // Função para autenticar o usuário
  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  // Funções para gerenciar projetos
  const handleAddProject = () => {
    const projectToAdd = {
      ...newProject,
      id: Date.now().toString(),
      tags: newProject.tags,
    };

    const updatedProjects = [...projects, projectToAdd];
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);

    // Resetar o formulário
    setNewProject({
      title: "",
      description: "",
      image: "",
      tags: [],
      link: "",
      github: "",
      color: "from-blue-500 to-cyan-500",
    });

    toast.success("Projeto adicionado", {
      description: "O projeto foi adicionado com sucesso!",
    });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleSaveEdit = () => {
    if (!editingProject) return;

    const updatedProjects = projects.map((p) =>
      p.id === editingProject.id ? editingProject : p
    );

    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    setEditingProject(null);

    toast.success("Projeto atualizado", {
      description: "O projeto foi atualizado com sucesso!",
    });
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter((p) => p.id !== id);
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);

    toast.success("Projeto removido", {
      description: "O projeto foi removido com sucesso!",
    });
  };

  const handleAddTag = (isNewProject: boolean) => {
    if (!newTag.trim()) return;

    if (isNewProject) {
      setNewProject({
        ...newProject,
        tags: [...newProject.tags, newTag.trim()],
      });
    } else if (editingProject) {
      setEditingProject({
        ...editingProject,
        tags: [...editingProject.tags, newTag.trim()],
      });
    }

    setNewTag("");
  };

  const handleRemoveTag = (tag: string, isNewProject: boolean) => {
    if (isNewProject) {
      setNewProject({
        ...newProject,
        tags: newProject.tags.filter((t) => t !== tag),
      });
    } else if (editingProject) {
      setEditingProject({
        ...editingProject,
        tags: editingProject.tags.filter((t) => t !== tag),
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.info("Sessão encerrada", {
      description: "Você foi desconectado do painel administrativo.",
    });
  };

  return (
    <>
      {!isAuthenticated ? (
        <AdminAuth onAuthenticated={handleAuthenticated} />
      ) : (
        <div className="container mx-auto py-8">
          {/* Header com Logo e Logout */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="gradient-text">Dashboard</span> Administrativo
              </h1>
              <p className="text-foreground/60">
                Gerencie seu portfólio e analise métricas
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>

          <Tabs defaultValue="portal" className="space-y-6">
            <TabsList className="mb-4 grid w-full max-w-5xl grid-cols-6">
              <TabsTrigger value="portal" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Portal
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="meta-pixel"
                className="flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Meta Pixel
              </TabsTrigger>
              <TabsTrigger value="form" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Formulário
              </TabsTrigger>
              <TabsTrigger value="supabase" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Supabase
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Projetos
              </TabsTrigger>
            </TabsList>

            {/* Nova aba de Portal do Cliente */}
            <TabsContent value="portal">
              <PortalClientManagement />
            </TabsContent>

            {/* Nova aba de Analytics */}
            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>

            {/* Nova aba de Meta Pixel */}
            <TabsContent value="meta-pixel">
              <MetaPixelManager />
            </TabsContent>

            {/* Nova aba de Formulário */}
            <TabsContent value="form">
              <ContactFormManager />
            </TabsContent>

            {/* Nova aba de Supabase */}
            <TabsContent value="supabase">
              <SupabaseConfig />
            </TabsContent>

            <TabsContent value="projects">
              <PortfolioProjectsManager />
            </TabsContent>

            {/* Implementação antiga removida - agora usa Supabase */}
            <TabsContent value="projects-old" className="hidden">
              <Tabs defaultValue="list">
                <TabsList className="mb-6">
                  <TabsTrigger value="list">Lista de Projetos</TabsTrigger>
                  <TabsTrigger value="add">Adicionar Projeto</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                  <div className="grid gap-6">
                    {projects.map((project) => (
                      <Card key={project.id}>
                        <CardContent className="p-6">
                          {editingProject &&
                          editingProject.id === project.id ? (
                            // Formulário de edição
                            <div className="space-y-4">
                              <div>
                                <label className="block mb-2 font-medium">
                                  Título
                                </label>
                                <Input
                                  value={editingProject.title}
                                  onChange={(e) =>
                                    setEditingProject({
                                      ...editingProject,
                                      title: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div>
                                <label className="block mb-2 font-medium">
                                  Descrição
                                </label>
                                <Textarea
                                  value={editingProject.description}
                                  onChange={(e) =>
                                    setEditingProject({
                                      ...editingProject,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div>
                                <label className="block mb-2 font-medium">
                                  URL da Imagem
                                </label>
                                <Input
                                  value={editingProject.image}
                                  onChange={(e) =>
                                    setEditingProject({
                                      ...editingProject,
                                      image: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div>
                                <label className="block mb-2 font-medium">
                                  Link do Projeto
                                </label>
                                <Input
                                  value={editingProject.link}
                                  onChange={(e) =>
                                    setEditingProject({
                                      ...editingProject,
                                      link: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div>
                                <label className="block mb-2 font-medium">
                                  Link do GitHub
                                </label>
                                <Input
                                  value={editingProject.github}
                                  onChange={(e) =>
                                    setEditingProject({
                                      ...editingProject,
                                      github: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div>
                                <label className="block mb-2 font-medium">
                                  Cor
                                </label>
                                <select
                                  className="w-full p-2 border rounded-md bg-background"
                                  value={editingProject.color}
                                  onChange={(e) =>
                                    setEditingProject({
                                      ...editingProject,
                                      color: e.target.value,
                                    })
                                  }
                                >
                                  {availableColors.map((color) => (
                                    <option
                                      key={color.value}
                                      value={color.value}
                                    >
                                      {color.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block mb-2 font-medium">
                                  Tags
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {editingProject.tags.map((tag) => (
                                    <div
                                      key={tag}
                                      className="px-3 py-1 bg-primary/10 rounded-full flex items-center gap-1"
                                    >
                                      <span>{tag}</span>
                                      <button
                                        onClick={() =>
                                          handleRemoveTag(tag, false)
                                        }
                                        className="text-foreground/60 hover:text-foreground"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Nova tag"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddTag(false);
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddTag(false)}
                                  >
                                    <Plus size={16} />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingProject(null)}
                                >
                                  Cancelar
                                </Button>
                                <Button onClick={handleSaveEdit}>
                                  <Save size={16} className="mr-2" /> Salvar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Visualização do projeto
                            <div className="flex gap-6">
                              <div className="w-1/3">
                                <img
                                  src={project.image}
                                  alt={project.title}
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                              </div>
                              <div className="w-2/3">
                                <h3 className="text-xl font-bold mb-2">
                                  {project.title}
                                </h3>
                                <p className="text-foreground/70 mb-4">
                                  {project.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                  {project.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditProject(project)}
                                  >
                                    <Pencil size={16} className="mr-2" /> Editar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteProject(project.id)
                                    }
                                  >
                                    <Trash2 size={16} className="mr-2" />{" "}
                                    Excluir
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="add">
                  <Card>
                    <CardHeader>
                      <CardTitle>Adicionar Novo Projeto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2 font-medium">
                            Título
                          </label>
                          <Input
                            value={newProject.title}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                title: e.target.value,
                              })
                            }
                            placeholder="Título do projeto"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">
                            Descrição
                          </label>
                          <Textarea
                            value={newProject.description}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                description: e.target.value,
                              })
                            }
                            placeholder="Descrição do projeto"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">
                            URL da Imagem
                          </label>
                          <Input
                            value={newProject.image}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                image: e.target.value,
                              })
                            }
                            placeholder="https://exemplo.com/imagem.jpg"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">
                            Link do Projeto
                          </label>
                          <Input
                            value={newProject.link}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                link: e.target.value,
                              })
                            }
                            placeholder="https://exemplo.com"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">
                            Link do GitHub
                          </label>
                          <Input
                            value={newProject.github}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                github: e.target.value,
                              })
                            }
                            placeholder="https://github.com/usuario/projeto"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">Cor</label>
                          <select
                            className="w-full p-2 border rounded-md bg-background"
                            value={newProject.color}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                color: e.target.value,
                              })
                            }
                          >
                            {availableColors.map((color) => (
                              <option key={color.value} value={color.value}>
                                {color.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">Tags</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {newProject.tags.map((tag) => (
                              <div
                                key={tag}
                                className="px-3 py-1 bg-primary/10 rounded-full flex items-center gap-1"
                              >
                                <span>{tag}</span>
                                <button
                                  onClick={() => handleRemoveTag(tag, true)}
                                  className="text-foreground/60 hover:text-foreground"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Nova tag"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddTag(true);
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddTag(true)}
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-end mt-6">
                          <Button onClick={handleAddProject}>
                            <Plus size={16} className="mr-2" /> Adicionar
                            Projeto
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}
