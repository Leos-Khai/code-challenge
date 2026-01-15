import { useState } from "react";
import type { Task } from "../types";
import { updateTask, deleteTask } from "../api";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onRefresh: () => void;
  onAnnounce: (message: string) => void;
}

type StatusFilter = "all" | "pending" | "in_progress" | "completed";
type PriorityFilter = "all" | 1 | 2 | 3 | 4 | 5;

export function TaskList({ tasks, loading, onRefresh, onAnnounce }: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Task["status"]>("pending");
  const [editPriority, setEditPriority] = useState(3);

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !task.title.toLowerCase().includes(search) &&
        !task.description.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    return true;
  });

  function getStatusLabel(status: Task["status"]) {
    const labels = { pending: "Pending", in_progress: "In Progress", completed: "Completed" };
    return labels[status];
  }

  function getPriorityLabel(p: number) {
    const labels = ["", "Low", "Med-Low", "Medium", "Med-High", "High"];
    return labels[p] ?? "";
  }

  async function handleStatusChange(task: Task, newStatus: Task["status"]) {
    try {
      await updateTask(task.id, { status: newStatus });
      onAnnounce(`Task "${task.title}" status changed to ${getStatusLabel(newStatus)}`);
      onRefresh();
    } catch {
      onAnnounce("Failed to update task status");
    }
  }

  function startEditing(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditPriority(task.priority);
  }

  async function handleSaveEdit(task: Task) {
    try {
      await updateTask(task.id, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority,
      });
      onAnnounce(`Task "${editTitle}" updated successfully`);
      setEditingId(null);
      onRefresh();
    } catch {
      onAnnounce("Failed to update task");
    }
  }

  async function handleDelete(task: Task) {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      onAnnounce(`Task "${task.title}" deleted`);
      onRefresh();
    } catch {
      onAnnounce("Failed to delete task");
    }
  }

  return (
    <div className="task-list-page">
      <h2>Active Tasks</h2>

      <div className="filters" role="search" aria-label="Filter tasks">
        <div className="filter-group">
          <label htmlFor="search-filter">Search</label>
          <input
            id="search-filter"
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="priority-filter">Priority</label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) => {
              const val = e.target.value;
              setPriorityFilter(val === "all" ? "all" : (Number(val) as PriorityFilter));
            }}
          >
            <option value="all">All Priorities</option>
            {[1, 2, 3, 4, 5].map((p) => (
              <option key={p} value={p}>
                {p} - {getPriorityLabel(p)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-info" aria-live="polite">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>

      {loading ? (
        <p className="loading">Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p className="no-tasks">
          {tasks.length === 0
            ? "No tasks yet. Add one to get started!"
            : "No tasks match your filters."}
        </p>
      ) : (
        <div className="table-container">
          <table aria-label="Tasks table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Description</th>
                <th scope="col">Status</th>
                <th scope="col">Priority</th>
                <th scope="col">Created</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className={`status-row-${task.status}`}>
                  {editingId === task.id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          aria-label="Edit title"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          aria-label="Edit description"
                        />
                      </td>
                      <td>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as Task["status"])}
                          aria-label="Edit status"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(Number(e.target.value))}
                          aria-label="Edit priority"
                        >
                          {[1, 2, 3, 4, 5].map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="save-btn"
                            onClick={() => handleSaveEdit(task)}
                            aria-label={`Save changes to ${task.title}`}
                          >
                            Save
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => setEditingId(null)}
                            aria-label="Cancel editing"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="title-cell">{task.title}</td>
                      <td className="description-cell">{task.description || "-"}</td>
                      <td>
                        <select
                          className={`status-select status-${task.status}`}
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task, e.target.value as Task["status"])
                          }
                          aria-label={`Change status for ${task.title}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        <span className={`priority-badge priority-${task.priority}`}>
                          {task.priority} - {getPriorityLabel(task.priority)}
                        </span>
                      </td>
                      <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => startEditing(task)}
                            aria-label={`Edit ${task.title}`}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(task)}
                            aria-label={`Delete ${task.title}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
