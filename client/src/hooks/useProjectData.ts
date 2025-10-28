import { useState, useEffect, useCallback } from "react";
import {
  getPortalProjectById,
  getPortalMilestones,
  getPortalTasks,
  getPortalFiles,
  getPortalActivityLogsByEntity,
  type PortalProject,
  type PortalMilestone,
  type PortalTask,
  type PortalFile,
  type PortalActivityLog,
} from "@/lib/supabase";

interface ProjectData {
  project: PortalProject | null;
  milestones: PortalMilestone[];
  tasks: PortalTask[];
  files: PortalFile[];
  activities: PortalActivityLog[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useProjectData = (projectId: string | undefined): ProjectData => {
  const [project, setProject] = useState<PortalProject | null>(null);
  const [milestones, setMilestones] = useState<PortalMilestone[]>([]);
  const [tasks, setTasks] = useState<PortalTask[]>([]);
  const [files, setFiles] = useState<PortalFile[]>([]);
  const [activities, setActivities] = useState<PortalActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar projeto
      const projectData = await getPortalProjectById(projectId);
      if (!projectData) {
        setError("Projeto não encontrado");
        return;
      }
      setProject(projectData);

      // Buscar dados relacionados em paralelo
      const [milestonesData, tasksData, filesData, activitiesData] =
        await Promise.all([
          getPortalMilestones(projectId),
          getPortalTasks(projectId),
          getPortalFiles(projectId, "project"),
          getPortalActivityLogsByEntity(projectId, "project"),
        ]);

      setMilestones(milestonesData);
      setTasks(tasksData);
      setFiles(filesData);
      setActivities(activitiesData);
    } catch (err: any) {
      console.error("Erro ao buscar dados do projeto:", err);
      setError(err.message || "Erro ao carregar projeto");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    project,
    milestones,
    tasks,
    files,
    activities,
    loading,
    error,
    refresh: fetchData,
  };
};
