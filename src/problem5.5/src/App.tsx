import { useState, useEffect, useCallback } from "react";
import type { Task } from "./types";
import { fetchTasks } from "./api";
import { Navigation } from "./components/Navigation";
import { AddTask } from "./components/AddTask";
import { TaskList } from "./components/TaskList";
import { AriaAnnouncer } from "./components/AriaAnnouncer";
import "./App.css";

type Page = "tasks" | "add";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchTasks();
      setTasks(response.data);
      setError(null);
    } catch {
      setError("Failed to load tasks. Is the backend running on port 3000?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function announce(message: string) {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 100);
  }

  function handleTaskCreated() {
    loadTasks();
    setCurrentPage("tasks");
  }

  return (
    <div className="app">
      <header>
        <h1>Task Manager</h1>
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      </header>

      <main>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        {currentPage === "add" && (
          <AddTask onTaskCreated={handleTaskCreated} onAnnounce={announce} />
        )}

        {currentPage === "tasks" && (
          <TaskList
            tasks={tasks}
            loading={loading}
            onRefresh={loadTasks}
            onAnnounce={announce}
          />
        )}
      </main>

      <AriaAnnouncer message={announcement} />
    </div>
  );
}

export default App;
