import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PortalMilestone } from "@/lib/supabase";
import {
  formatDate,
  getMilestoneStatusColor,
  translateMilestoneStatus,
} from "@/lib/portalUtils";

interface ProjectTimelineProps {
  milestones: PortalMilestone[];
}

export default function ProjectTimeline({ milestones }: ProjectTimelineProps) {
  // Ordenar milestones por ordem
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum marco definido para este projeto ainda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Timeline do Projeto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedMilestones.map((milestone, index) => {
            const statusColor = getMilestoneStatusColor(milestone.status);
            const statusLabel = translateMilestoneStatus(milestone.status);
            const isCompleted = milestone.status === "completed";
            const isActive = milestone.status === "in_progress";

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative"
              >
                {/* Connector Line */}
                {index < sortedMilestones.length - 1 && (
                  <div
                    className={`absolute left-6 top-12 h-full w-0.5 ${
                      isCompleted ? "bg-green-500/30" : "bg-border"
                    }`}
                  />
                )}

                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="relative z-10">
                    {isCompleted ? (
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full ${
                          isActive ? "bg-blue-500/20" : "bg-muted"
                        } flex items-center justify-center`}
                      >
                        <Circle
                          className={`h-6 w-6 ${
                            isActive ? "text-blue-500" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-muted-foreground">
                              MARCO {milestone.order}
                            </span>
                            <Badge className={statusColor}>{statusLabel}</Badge>
                          </div>
                          <h4 className="text-lg font-semibold">
                            {milestone.name}
                          </h4>
                        </div>
                      </div>

                      {/* Description */}
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {milestone.description}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                        {milestone.due_date && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Prazo: {formatDate(milestone.due_date)}</span>
                          </div>
                        )}
                        {milestone.completed_at && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>
                              Concluído: {formatDate(milestone.completed_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress */}
                      {!isCompleted && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              Progresso
                            </span>
                            <span className="text-xs font-semibold">
                              {milestone.progress || 0}%
                            </span>
                          </div>
                          <Progress
                            value={milestone.progress || 0}
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {milestones.filter((m) => m.status === "completed").length}
              </div>
              <div className="text-xs text-muted-foreground">Concluídos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {milestones.filter((m) => m.status === "in_progress").length}
              </div>
              <div className="text-xs text-muted-foreground">Em Progresso</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {milestones.filter((m) => m.status === "pending").length}
              </div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
