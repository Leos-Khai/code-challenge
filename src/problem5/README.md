# Problem 5: A Crude Server

A RESTful API server built with Express.js and TypeScript for managing tasks, with SQLite for data persistence.

## Prerequisites

- Node.js (v18 or higher)
- npm

## Installation

1. Navigate to the problem5 directory:
   ```bash
   cd src/problem5
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

### Production Mode

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000` by default. You can change the port by setting the `PORT` environment variable.

## API Endpoints

### Health Check

```
GET /health
```

Returns server status.

### Tasks API

Base URL: `/api/tasks`

#### Create a Task

```
POST /api/tasks
Content-Type: application/json

{
  "title": "Task title",          // required
  "description": "Description",   // optional, default: ""
  "status": "pending",            // optional, default: "pending"
  "priority": 3                   // optional, default: 3 (range: 1-5)
}
```

**Response:** `201 Created`

#### List Tasks

```
GET /api/tasks
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status: `pending`, `in_progress`, `completed` |
| priority | number | Filter by priority (1-5) |
| search | string | Search in title and description |
| limit | number | Number of results (default: 10) |
| offset | number | Pagination offset (default: 0) |

**Response:** `200 OK`
```json
{
  "data": [...],
  "total": 10,
  "limit": 10,
  "offset": 0
}
```

#### Get a Task

```
GET /api/tasks/:id
```

**Response:** `200 OK` or `404 Not Found`

#### Update a Task

```
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated title",       // optional
  "description": "Updated desc",  // optional
  "status": "completed",          // optional
  "priority": 5                   // optional
}
```

**Response:** `200 OK` or `404 Not Found`

#### Delete a Task

```
DELETE /api/tasks/:id
```

**Response:** `204 No Content` or `404 Not Found`

## Example Usage

```bash
# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Complete project", "priority": 5}'

# List all tasks
curl http://localhost:3000/api/tasks

# List pending tasks with high priority
curl "http://localhost:3000/api/tasks?status=pending&priority=5"

# Search tasks
curl "http://localhost:3000/api/tasks?search=project"

# Get a specific task
curl http://localhost:3000/api/tasks/1

# Update a task
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Delete a task
curl -X DELETE http://localhost:3000/api/tasks/1
```

## Project Structure

```
src/problem5/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app configuration
│   ├── database.ts           # SQLite database setup
│   ├── models/
│   │   └── task.ts           # Type definitions
│   ├── services/
│   │   └── taskService.ts    # Business logic
│   ├── controllers/
│   │   └── taskController.ts # Request handlers
│   ├── routes/
│   │   └── tasks.ts          # Route definitions
│   └── middleware/
│       └── errorHandler.ts   # Error handling
├── data/                     # SQLite database file (auto-created)
├── package.json
├── tsconfig.json
└── README.md
```

## Database

The application uses SQLite for data persistence. The database file is automatically created in the `data/` directory when the server starts.

### Task Schema

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| title | TEXT | Task title (required) |
| description | TEXT | Task description |
| status | TEXT | `pending`, `in_progress`, or `completed` |
| priority | INTEGER | 1 (low) to 5 (high) |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |
