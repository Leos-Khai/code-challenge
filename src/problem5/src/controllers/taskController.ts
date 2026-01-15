import type { Request, Response, NextFunction } from "express";
import * as taskService from "../services/taskService.js";
import type { CreateTaskDTO, UpdateTaskDTO, TaskFilters } from "../models/task.js";

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data: CreateTaskDTO = req.body;

    if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    if (data.status && !["pending", "in_progress", "completed"].includes(data.status)) {
      res.status(400).json({ error: "Invalid status. Must be pending, in_progress, or completed" });
      return;
    }

    if (data.priority !== undefined && (data.priority < 1 || data.priority > 5)) {
      res.status(400).json({ error: "Priority must be between 1 and 5" });
      return;
    }

    const task = await taskService.createTask(data);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function getAllTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: TaskFilters = {
      status: req.query.status as TaskFilters["status"],
      priority: req.query.priority ? parseInt(req.query.priority as string, 10) : undefined,
      search: req.query.search as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    };

    if (filters.status && !["pending", "in_progress", "completed"].includes(filters.status)) {
      res.status(400).json({ error: "Invalid status filter" });
      return;
    }

    const result = await taskService.getAllTasks(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id!, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const task = await taskService.getTaskById(id);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id!, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const data: UpdateTaskDTO = req.body;

    if (data.status && !["pending", "in_progress", "completed"].includes(data.status)) {
      res.status(400).json({ error: "Invalid status. Must be pending, in_progress, or completed" });
      return;
    }

    if (data.priority !== undefined && (data.priority < 1 || data.priority > 5)) {
      res.status(400).json({ error: "Priority must be between 1 and 5" });
      return;
    }

    const task = await taskService.updateTask(id, data);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id!, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const deleted = await taskService.deleteTask(id);

    if (!deleted) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
