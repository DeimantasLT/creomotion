import { useState, useEffect, useCallback } from 'react';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
export type TaskCategory = 
  | 'PRE_PRODUCTION' 
  | 'SHOOTING' 
  | 'EDITING' 
  | 'MOTION_GRAPHICS'
  | 'COLOR'
  | 'SOUND'
  | 'VFX'
  | 'DELIVERY'
  | 'REVISION'
  | 'OTHER';

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  order: number;
  estimatedHours: number | null;
  actualHours: number;
  billableHours: number;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    timeEntries: number;
  };
}

interface UseTasksOptions {
  projectId: string;
  refreshTrigger?: number;
}

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  PRE_PRODUCTION: 'Prieš produkciją',
  SHOOTING: 'Filmavimas',
  EDITING: 'Montažas',
  MOTION_GRAPHICS: 'Motion Graphics',
  COLOR: 'Spalvų koregavimas',
  SOUND: 'Garso dizainas',
  VFX: 'VFX efektai',
  DELIVERY: 'Pristatymas',
  REVISION: 'Korekcijos',
  OTHER: 'Kita',
};

const CATEGORY_SHORT: Record<TaskCategory, string> = {
  PRE_PRODUCTION: 'Pre-pro',
  SHOOTING: 'Filmavimas',
  EDITING: 'Montažas',
  MOTION_GRAPHICS: 'Motion',
  COLOR: 'Spalvos',
  SOUND: 'Garsas',
  VFX: 'VFX',
  DELIVERY: 'Pristatymas',
  REVISION: 'Korekcijos',
  OTHER: 'Kita',
};

export const useTasks = ({ projectId, refreshTrigger = 0 }: UseTasksOptions) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);

  // Group tasks by status
  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    REVIEW: tasks.filter((t) => t.status === 'REVIEW'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
    BLOCKED: tasks.filter((t) => t.status === 'BLOCKED'),
  };

  // Group tasks by category
  const tasksByCategory = tasks.reduce((acc, task) => {
    const cat = task.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {} as Record<TaskCategory, Task[]>);

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'DONE').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    review: tasks.filter((t) => t.status === 'REVIEW').length,
    blocked: tasks.filter((t) => t.status === 'BLOCKED').length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    totalEstimated: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
    totalActual: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
    totalBillable: tasks.reduce((sum, t) => sum + (t.billableHours || 0), 0),
    progress: tasks.length > 0 
      ? Math.round((tasks.filter((t) => t.status === 'DONE').length / tasks.length) * 100)
      : 0,
  };

  const createTask = async (data: {
    name: string;
    description?: string;
    category?: TaskCategory;
    estimatedHours?: number;
    order?: number;
  }) => {
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create task');
    }

    await fetchTasks();
    return response.json();
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update task');
    }

    await fetchTasks();
    return response.json();
  };

  const deleteTask = async (taskId: string) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete task');
    }

    await fetchTasks();
    return response.json();
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const reorderTasks = async (taskIds: string[]) => {
    await Promise.all(
      taskIds.map((id, index) => updateTask(id, { order: index }))
    );
  };

  const getCategoryLabel = (category: TaskCategory) => CATEGORY_LABELS[category];
  const getCategoryShort = (category: TaskCategory) => CATEGORY_SHORT[category];

  return {
    tasks,
    tasksByStatus,
    tasksByCategory,
    stats,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
    getCategoryLabel,
    getCategoryShort,
  };
};
