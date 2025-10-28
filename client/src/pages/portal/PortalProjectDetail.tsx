import { useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  MessageSquare,
  Activity,
  TrendingUp,
} from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useProjectData } from "@/hooks/useProjectData";
import ProjectTimeline from "@/components/portal/ProjectTimeline";
import TaskList from "@/components/portal/TaskList";
import FileUpload from "@/components/portal/FileUpload";
import FileManager from "@/components/portal/FileManager";
import {
  formatCurrency,
  formatDate,
  getProjectStatusColorBadge,
  translateProjectStatus,
  formatRelativeDate,
} from "@/lib/portalUtils";

export default function PortalProjectDetail() {
  const params = useParams();
  const projectId = params.id;

  const {
    project,
    milestones,
    tasks,
    files,
    activities,
    loading,
    error,
    refresh,
  } = useProjectData(projectId);

  if (loading) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </PortalLayout>
    );
  }

  if (error || !project) {
    return (
      <PortalLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Projeto não encontrado"}
          </AlertDescription>
        </Alert>
        <div className="flex gap-3 mt-4">
          <Button onClick={() => (window.location.href = "/portal/projects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Projetos
          </Button>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      </PortalLayout>
    );
  }

  const statusColor = getProjectStatusColorBadge(project.status);
  const statusLabel = translateProjectStatus(project.status);

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/portal/projects")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Projetos
          </Button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <Badge className={statusColor}>{statusLabel}</Badge>
              </div>
              {project.description && (
                <p className="text-muted-foreground">{project.description}</p>
              )}
            </div>

            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {project.progress || 0}%
                </div>
                <Progress value={project.progress || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                Datas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {project.start_date && (
                  <div>
                    <span className="text-muted-foreground">Início: </span>
                    <span className="font-medium">
                      {formatDate(project.start_date)}
                    </span>
                  </div>
                )}
                {project.end_date && (
                  <div>
                    <span className="text-muted-foreground">Prazo: </span>
                    <span className="font-medium">
                      {formatDate(project.end_date)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-500" />
                Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.budget ? formatCurrency(project.budget) : "N/A"}
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Tarefas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Total: </span>
                  <span className="font-medium">{tasks.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Concluídas: </span>
                  <span className="font-medium text-green-600">
                    {tasks.filter((t) => t.status === "completed").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="files">Arquivos ({files.length})</TabsTrigger>
              <TabsTrigger value="activity">Atividades</TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4">
              <ProjectTimeline milestones={milestones} />
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              <TaskList tasks={tasks} />
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-4">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Arquivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    projectId={project.id!}
                    onUploadComplete={(file) => {
                      console.log("Arquivo enviado:", file);
                      refresh(); // Atualizar lista
                    }}
                  />
                </CardContent>
              </Card>

              {/* Files Manager */}
              <FileManager
                projectId={project.id!}
                onFileDelete={() => refresh()}
                showUploadButton={false}
              />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Atividades Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma atividade registrada ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm">{activity.action}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeDate(activity.created_at!)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PortalLayout>
  );
}
