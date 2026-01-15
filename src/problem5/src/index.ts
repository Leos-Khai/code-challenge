import "dotenv/config";
import app from "./app.js";
import { initializeDatabase } from "./database.js";

const PORT = process.env.PORT ?? 3000;

async function main() {
  try {
    await initializeDatabase();
    console.log("Database initialized");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API base: http://localhost:${PORT}/api/tasks`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
