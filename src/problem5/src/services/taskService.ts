import { getOne, getAll, runInsert, runUpdate } from "../database.js";
import type {
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskFilters,
  TaskListResponse,
} from "../models/task.js";

interface TaskRow {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: number;
  created_at: string;
  updated_at: string;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createTask(data: CreateTaskDTO): Promise<Task> {
  const { title, description = "", status = "pending", priority = 3 } = data;

  const now = new Date().toISOString();
  const id = await runInsert(
    `INSERT INTO tasks (title, description, status, priority, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, status, priority, now, now]
  );

  const task = await getTaskById(id);
  if (!task) {
    throw new Error("Failed to create task");
  }
  return task;
}

export async function getAllTasks(filters: TaskFilters): Promise<TaskListResponse> {
  const { status, priority, search, limit = 10, offset = 0 } = filters;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  if (priority) {
    conditions.push("priority = ?");
    params.push(priority);
  }

  if (search) {
    conditions.push("(title LIKE ? OR description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await getOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM tasks ${whereClause}`,
    params
  );
  const total = countResult?.count ?? 0;

  const rows = await getAll<TaskRow>(
    `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: rows.map(rowToTask),
    total,
    limit,
    offset,
  };
}

export async function getTaskById(id: number): Promise<Task | null> {
  const row = await getOne<TaskRow>("SELECT * FROM tasks WHERE id = ?", [id]);
  return row ? rowToTask(row) : null;
}

export async function updateTask(id: number, data: UpdateTaskDTO): Promise<Task | null> {
  const existing = await getTaskById(id);
  if (!existing) {
    return null;
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (data.title !== undefined) {
    updates.push("title = ?");
    params.push(data.title);
  }

  if (data.description !== undefined) {
    updates.push("description = ?");
    params.push(data.description);
  }

  if (data.status !== undefined) {
    updates.push("status = ?");
    params.push(data.status);
  }

  if (data.priority !== undefined) {
    updates.push("priority = ?");
    params.push(data.priority);
  }

  if (updates.length === 0) {
    return existing;
  }

  updates.push("updated_at = ?");
  params.push(new Date().toISOString());
  params.push(id);

  await runUpdate(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`, params);

  return getTaskById(id);
}

export async function deleteTask(id: number): Promise<boolean> {
  const changes = await runUpdate("DELETE FROM tasks WHERE id = ?", [id]);
  return changes > 0;
}
