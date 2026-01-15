import { useState } from "react";
import type { CreateTaskDTO } from "../types";
import { createTask } from "../api";

interface AddTaskProps {
  onTaskCreated: () => void;
  onAnnounce: (message: string) => void;
}

export function AddTask({ onTaskCreated, onAnnounce }: AddTaskProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function getPriorityLabel(p: number) {
    const labels = ["", "Low", "Medium-Low", "Medium", "Medium-High", "High"];
    return labels[p] ?? "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data: CreateTaskDTO = {
        title: title.trim(),
        description: description.trim(),
        priority,
      };
      await createTask(data);
      onAnnounce(`Task "${title}" created successfully`);
      setTitle("");
      setDescription("");
      setPriority(3);
      onTaskCreated();
    } catch {
      onAnnounce("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="add-task-page">
      <h2>Create New Task</h2>
      <form className="add-task-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="task-title">
            Title <span aria-hidden="true">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            placeholder="Enter task description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((p) => (
              <option key={p} value={p}>
                {p} - {getPriorityLabel(p)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Task"}
        </button>
      </form>
    </div>
  );
}
