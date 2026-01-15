export interface Task {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: "pending" | "in_progress" | "completed";
  priority?: number;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: "pending" | "in_progress" | "completed";
  priority?: number;
}

export interface TaskListResponse {
  data: Task[];
  total: number;
  limit: number;
  offset: number;
}
