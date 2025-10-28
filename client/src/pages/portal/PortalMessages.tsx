import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Inbox, Search, Filter } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import ChatBox from "@/components/portal/ChatBox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMessages } from "@/hooks/useMessages";
import { usePortalAuthContext } from "@/contexts/PortalAuthContext";
import { getPortalProjects, type PortalProject } from "@/lib/supabase";
import { formatRelativeDate } from "@/lib/portalUtils";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function PortalMessages() {
  const { user } = usePortalAuthContext();
  const { client } = useDashboardData();
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);

  const { messages, loading, error, sending, sendMessage, markAsRead } =
    useMessages(selectedProjectId || undefined);

  // Buscar projetos
  useEffect(() => {
    const fetchProjects = async () => {
      if (!client?.id) return;

      try {
        setLoadingProjects(true);
        const data = await getPortalProjects(client.id);
        setProjects(data);

        // Selecionar o primeiro projeto automaticamente
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id!);
        }
      } catch (err) {
        console.error("Erro ao buscar projetos:", err);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [client?.id]);

  const handleSendMessage = async (content: string): Promise<boolean> => {
    if (!user?.id || !selectedProjectId) return false;

    return await sendMessage(content, user.id, "client");
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Filtrar projetos por busca
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Contar mensagens não lidas por projeto
  const getUnreadCount = (projectId: string) => {
    // TODO: Implementar contador real de mensagens não lidas
    return 0;
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mensagens</h1>
            <p className="text-muted-foreground mt-1">
              Converse sobre seus projetos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Projetos (Sidebar) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  Projetos
                </CardTitle>

                {/* Search */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar projeto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loadingProjects ? (
                  <div className="space-y-2 p-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground px-4">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum projeto encontrado</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredProjects.map((project) => {
                      const isSelected = project.id === selectedProjectId;
                      const unreadCount = getUnreadCount(project.id!);

                      return (
                        <button
                          key={project.id}
                          onClick={() => setSelectedProjectId(project.id!)}
                          className={cn(
                            "w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors",
                            isSelected && "bg-muted border-l-4 border-primary"
                          )}
                        >
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {project.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {project.name}
                              </h4>
                              {unreadCount > 0 && (
                                <Badge
                                  variant="default"
                                  className="h-5 min-w-5 px-1.5 text-xs"
                                >
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {project.description || "Sem descrição"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {selectedProjectId ? (
              <ChatBox
                messages={messages}
                loading={loading}
                error={error}
                sending={sending}
                currentUserId={user?.id || ""}
                onSendMessage={handleSendMessage}
                onMarkAsRead={markAsRead}
                projectName={selectedProject?.name}
              />
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    Selecione um projeto
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha um projeto na lista para ver as mensagens
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </PortalLayout>
  );
}

