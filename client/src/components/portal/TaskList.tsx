import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PortalTask } from "@/lib/supabase";
import {
  formatDate,
  getTaskStatusColor,
  translateTaskStatus,
  getTaskPriorityColor,
  translateTaskPriority,
} from "@/lib/portalUtils";

interface TaskListProps {
  tasks: PortalTask[];
}

type TaskFilter = "all" | "pending" | "in_progress" | "review" | "completed";

export default function TaskList({ tasks }: TaskListProps) {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Filtrar tarefas
  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  // Agrupar por status
  const groupedTasks = {
    pending: filteredTasks.filter((t) => t.status === "pending"),
    in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
    review: filteredTasks.filter((t) => t.status === "review"),
    completed: filteredTasks.filter((t) => t.status === "completed"),
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma tarefa definida para este projeto ainda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderTaskIcon = (status: PortalTask["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "review":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const isOverdue = (task: PortalTask) => {
    if (!task.due_date || task.status === "completed") return false;
    return new Date(task.due_date) < new Date();
  };

  const renderTask = (task: PortalTask) => {
    const isExpanded = expandedTasks.has(task.id!);
    const overdue = isOverdue(task);
    const statusColor = getTaskStatusColor(task.status);
    const statusLabel = translateTaskStatus(task.status);

    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="border border-border rounded-lg hover:shadow-md transition-shadow"
      >
        <div
          className="p-4 cursor-pointer"
          onClick={() => toggleTask(task.id!)}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="mt-0.5">{renderTaskIcon(task.status)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4
                  className={`font-medium ${
                    task.status === "completed"
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {task.name}
                </h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.priority && (
                    <Badge className={getTaskPriorityColor(task.priority)}>
                      {translateTaskPriority(task.priority)}
                    </Badge>
                  )}
                  <Badge className={statusColor}>{statusLabel}</Badge>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {task.due_date && (
                  <div
                    className={`flex items-center gap-1 ${
                      overdue ? "text-red-500 font-medium" : ""
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {overdue ? "Atrasada: " : "Prazo: "}
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                )}
                {task.estimated_hours && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{task.estimated_hours}h estimadas</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/30">
                {task.description && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-1">Descrição:</h5>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {task.completed_at && (
                    <div>
                      <span className="text-muted-foreground">
                        Concluída em:
                      </span>
                      <p className="font-medium text-green-600">
                        {formatDate(task.completed_at)}
                      </p>
                    </div>
                  )}
                  {task.actual_hours && (
                    <div>
                      <span className="text-muted-foreground">
                        Horas gastas:
                      </span>
                      <p className="font-medium">{task.actual_hours}h</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tarefas ({filteredTasks.length})</CardTitle>
          <Select
            value={filter}
            onValueChange={(value: TaskFilter) => setFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="review">Em Revisão</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Tasks by Status */}
          {filter === "all" ? (
            <>
              {/* In Progress */}
              {groupedTasks.in_progress.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    EM PROGRESSO ({groupedTasks.in_progress.length})
                  </h3>
                  <div className="space-y-2">
                    {groupedTasks.in_progress.map(renderTask)}
                  </div>
                </div>
              )}

              {/* Review */}
              {groupedTasks.review.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    EM REVISÃO ({groupedTasks.review.length})
                  </h3>
                  <div className="space-y-2">
                    {groupedTasks.review.map(renderTask)}
                  </div>
                </div>
              )}

              {/* Pending */}
              {groupedTasks.pending.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Circle className="h-4 w-4" />
                    PENDENTES ({groupedTasks.pending.length})
                  </h3>
                  <div className="space-y-2">
                    {groupedTasks.pending.map(renderTask)}
                  </div>
                </div>
              )}

              {/* Completed */}
              {groupedTasks.completed.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    CONCLUÍDAS ({groupedTasks.completed.length})
                  </h3>
                  <div className="space-y-2">
                    {groupedTasks.completed.map(renderTask)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">{filteredTasks.map(renderTask)}</div>
          )}

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma tarefa encontrada com este filtro</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
