import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { PortalProject } from "@/lib/supabase";
import {
  formatCurrency,
  formatDate,
  getProjectStatusColorBadge,
  translateProjectStatus,
} from "@/lib/portalUtils";

interface ProjectCardProps {
  project: PortalProject;
  viewMode: "grid" | "list";
}

export default function ProjectCard({ project, viewMode }: ProjectCardProps) {
  const statusColor = getProjectStatusColorBadge(project.status);
  const statusLabel = translateProjectStatus(project.status);

  const handleViewDetails = () => {
    window.location.href = `/portal/projects/${project.id}`;
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Left: Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {project.description}
                  </p>
                )}
              </div>
              <Badge className={statusColor}>{statusLabel}</Badge>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {project.start_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Início: {formatDate(project.start_date)}</span>
                </div>
              )}
              {project.end_date && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Prazo: {formatDate(project.end_date)}</span>
                </div>
              )}
              {project.budget && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>{formatCurrency(project.budget)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Progress & Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <div className="min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progresso</span>
                <span className="text-xs font-semibold">
                  {project.progress || 0}%
                </span>
              </div>
              <Progress value={project.progress || 0} className="h-2" />
            </div>

            <Button onClick={handleViewDetails} variant="outline" size="sm">
              Ver Detalhes
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Grid View
  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col"
      onClick={handleViewDetails}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {project.name}
          </CardTitle>
          <Badge className={statusColor}>{statusLabel}</Badge>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Dates */}
          <div className="space-y-2">
            {project.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Início: {formatDate(project.start_date)}
                </span>
              </div>
            )}
            {project.end_date && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Prazo: {formatDate(project.end_date)}
                </span>
              </div>
            )}
          </div>

          {/* Budget */}
          {project.budget && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {formatCurrency(project.budget)}
              </span>
            </div>
          )}

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>Progresso</span>
              </div>
              <span className="text-sm font-semibold">
                {project.progress || 0}%
              </span>
            </div>
            <Progress value={project.progress || 0} className="h-2" />
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full mt-4"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          Ver Detalhes
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
