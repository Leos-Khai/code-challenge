interface NavigationProps {
  currentPage: "tasks" | "add";
  onNavigate: (page: "tasks" | "add") => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <button
        className={currentPage === "tasks" ? "active" : ""}
        onClick={() => onNavigate("tasks")}
        aria-current={currentPage === "tasks" ? "page" : undefined}
      >
        Active Tasks
      </button>
      <button
        className={currentPage === "add" ? "active" : ""}
        onClick={() => onNavigate("add")}
        aria-current={currentPage === "add" ? "page" : undefined}
      >
        Add Task
      </button>
    </nav>
  );
}
