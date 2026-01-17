# Live Scoreboard Module - Technical Specification

## 1. Overview

This document specifies a Live Scoreboard Module for a web application that displays the top 10 user scores with real-time updates. The module securely handles score updates and prevents unauthorized score manipulation.

### Key Features

- Real-time Leaderboard: Top 10 scores updated live via WebSocket
- Secure Score Updates: Action token system prevents cheating
- High Performance: Redis caching for fast leaderboard queries
- Audit Trail: All score changes logged for review

### Diagrams

| Diagram             | Description                | File                                                       |
| ------------------- | -------------------------- | ---------------------------------------------------------- |
| System Architecture | Component overview         | [diagrams/architecture.puml](diagrams/architecture.puml)   |
| Score Update Flow   | End-to-end sequence        | [diagrams/score-flow.puml](diagrams/score-flow.puml)       |
| Security Flow       | Token validation lifecycle | [diagrams/security-flow.puml](diagrams/security-flow.puml) |

---

## 2. Architecture

### 2.1 System Components

| Component        | Technology      | Purpose                     |
| ---------------- | --------------- | --------------------------- |
| REST API Server  | Node.js/Express | Handle HTTP requests        |
| WebSocket Server | Socket.io / ws  | Real-time communication     |
| Database         | PostgreSQL      | Persistent storage          |
| Cache            | Redis           | Leaderboard cache & pub/sub |
| Auth             | JWT             | User authentication         |

### 2.2 Data Flow

```
Client → API Gateway → REST API → Database
                    ↘ WebSocket ← Redis Pub/Sub
```

1. Client authenticates and receives JWT
2. Client requests action token before performing action
3. Client submits completed action with token
4. Server validates, updates score, broadcasts via WebSocket

---

## 3. API Specification

### 3.1 Authentication

All endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <jwt_token>
```

### 3.2 Endpoints

#### GET /api/leaderboard

Retrieve the top 10 scores.

Response: 200 OK
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "uuid",
      "username": "player1",
      "score": 15000,
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "cached_at": "2024-01-15T10:30:05Z"
}
```

#### POST /api/actions/start

Request an action token before performing a score-eligible action.

Request:
```json
{
  "action_type": "complete_level",
  "metadata": {
    "level_id": 5
  }
}
```

Response: 200 OK
```json
{
  "action_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_at": "2024-01-15T10:45:00Z",
  "score_value": 100
}
```

Error Responses:
| Code | Description                        |
| ---- | ---------------------------------- |
| 401  | Unauthorized - Invalid/missing JWT |
| 429  | Rate limited - Too many requests   |

#### POST /api/actions/complete

Submit a completed action for score update.

Request:
```json
{
  "action_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response: 200 OK
```json
{
  "success": true,
  "score_added": 100,
  "new_total": 5200,
  "new_rank": 7
}
```

Error Responses:
| Code | Description                            |
| ---- | -------------------------------------- |
| 400  | Bad request - Missing token            |
| 401  | Unauthorized - Invalid token signature |
| 403  | Forbidden - Token already used         |
| 410  | Gone - Token expired                   |

---

## 4. WebSocket Protocol

### 4.1 Connection

```
wss://api.example.com/ws/leaderboard
```

Authentication: Send JWT after connection:
```json
{
  "type": "auth",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Auth Response:
```json
{
  "type": "auth_success",
  "user_id": "uuid"
}
```

### 4.2 Message Types

#### Server → Client: leaderboard_update

Sent when any score in the top 10 changes.

```json
{
  "type": "leaderboard_update",
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "uuid",
      "username": "player1",
      "score": 15000
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Server → Client: score_update

Sent to the specific user when their score changes.

```json
{
  "type": "score_update",
  "user_id": "uuid",
  "score_added": 100,
  "new_total": 5200,
  "new_rank": 7
}
```

#### Client → Server: ping

Keep-alive message.

```json
{
  "type": "ping"
}
```

#### Server → Client: pong

```json
{
  "type": "pong"
}
```

### 4.3 Reconnection

- Client should implement exponential backoff
- Reconnect delays: 1s, 2s, 4s, 8s, max 30s
- On reconnect, re-authenticate and request latest leaderboard

---

## 5. Security Model

### 5.1 Action Token System

The action token prevents malicious score increases by ensuring:

1. Server-initiated: Only the server can generate valid tokens
2. Time-limited: Tokens expire after 5-15 minutes
3. One-time use: Each token can only be used once
4. User-bound: Token is tied to the authenticated user

#### Token Structure (JWT)

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": "uuid",
    "action_type": "complete_level",
    "score_value": 100,
    "nonce": "unique-uuid",
    "iat": 1705312200,
    "exp": 1705313100
  }
}
```

#### Token Flow

```
1. Client: POST /api/actions/start
2. Server: Generate token, store nonce hash in DB
3. Client: Perform action, hold token
4. Client: POST /api/actions/complete {token}
5. Server: Verify signature, check nonce unused, mark used
6. Server: Update score, broadcast
```

### 5.2 Rate Limiting

| Endpoint                   | Limit | Window     |
| -------------------------- | ----- | ---------- |
| POST /api/actions/start    | 10    | per minute |
| POST /api/actions/complete | 10    | per minute |
| GET /api/leaderboard       | 60    | per minute |
| WebSocket connections      | 5     | per user   |

### 5.3 Additional Protections

| Protection         | Description                        |
| ------------------ | ---------------------------------- |
| Score Delta Limits | Max score increase per action type |
| Daily Score Cap    | Maximum total score gain per day   |
| IP Tracking        | Log IP for anomaly detection       |
| Audit Logging      | All score changes recorded         |
| Anomaly Detection  | Flag suspicious patterns           |

---

## 6. Database Schema

### 6.1 Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    score BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_score ON users(score DESC);
```

#### action_tokens
```sql
CREATE TABLE action_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    nonce_hash VARCHAR(64) UNIQUE NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    score_value INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_action_tokens_nonce ON action_tokens(nonce_hash);
CREATE INDEX idx_action_tokens_expires ON action_tokens(expires_at);
```

#### score_history
```sql
CREATE TABLE score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    previous_score BIGINT NOT NULL,
    new_score BIGINT NOT NULL,
    score_delta INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_token_id UUID REFERENCES action_tokens(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_score_history_user ON score_history(user_id, created_at DESC);
```

### 6.2 Redis Data Structures

```redis
# Sorted set for leaderboard (score as rank)
ZADD leaderboard <score> <user_id>

# Get top 10
ZREVRANGE leaderboard 0 9 WITHSCORES

# Increment score
ZINCRBY leaderboard <delta> <user_id>

# Rate limiting
INCR rate:<user_id>:<endpoint>
EXPIRE rate:<user_id>:<endpoint> 60

# Pub/Sub channel
PUBLISH score_updates {user_id, new_score, new_rank}
```

---

## 7. Caching Strategy

### 7.1 Leaderboard Cache

- Storage: Redis sorted set (`leaderboard`)
- TTL: No expiry (always in sync)
- Invalidation: On score update via `ZINCRBY`

### 7.2 Cache Warming

On server start:
```sql
SELECT id, score FROM users ORDER BY score DESC LIMIT 100;
```
Load into Redis sorted set.

### 7.3 Read Path

```
1. Client: GET /api/leaderboard
2. Server: ZREVRANGE leaderboard 0 9 WITHSCORES
3. Server: Return cached data (< 1ms)
```

### 7.4 Write Path

```
1. Server: Update PostgreSQL (source of truth)
2. Server: ZINCRBY leaderboard <delta> <user_id>
3. Server: PUBLISH score_updates {...}
```

---

## 8. Error Handling

### 8.1 Error Response Format

```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Action token has expired",
    "details": {
      "expired_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 8.2 Error Codes

| Code           | HTTP | Description                    |
| -------------- | ---- | ------------------------------ |
| AUTH_REQUIRED  | 401  | Missing authentication         |
| AUTH_INVALID   | 401  | Invalid JWT token              |
| TOKEN_INVALID  | 401  | Invalid action token signature |
| TOKEN_EXPIRED  | 410  | Action token expired           |
| TOKEN_USED     | 403  | Action token already used      |
| RATE_LIMITED   | 429  | Too many requests              |
| INTERNAL_ERROR | 500  | Server error                   |

### 8.3 Graceful Degradation

| Failure            | Fallback                      |
| ------------------ | ----------------------------- |
| Redis down         | Query PostgreSQL directly     |
| WebSocket down     | Client polls /api/leaderboard |
| Token service down | Return 503, retry later       |

---

## 9. Improvements & Scalability

### 9.1 Horizontal Scaling

Challenge: Multiple WebSocket servers need synchronized broadcasts.

Solution: Redis Pub/Sub
```
┌─────────────┐     ┌─────────────┐
│ WS Server 1 │ ←── │    Redis    │ ──→ │ WS Server 2 │
└─────────────┘     │   Pub/Sub   │     └─────────────┘
                    └─────────────┘
```

All WebSocket servers subscribe to `score_updates` channel and broadcast to their connected clients.

### 9.2 Performance Optimizations

| Optimization       | Benefit                         |
| ------------------ | ------------------------------- |
| Connection pooling | Reduce DB connection overhead   |
| Batch updates      | Aggregate rapid score changes   |
| Edge caching       | CDN cache for leaderboard reads |
| Compression        | Reduce WebSocket payload size   |

### 9.3 Anti-Cheat Enhancements

| Enhancement           | Description                      |
| --------------------- | -------------------------------- |
| ML anomaly detection  | Flag unusual score patterns      |
| Device fingerprinting | Track suspicious devices         |
| Behavioral analysis   | Detect bot-like behavior         |
| Score velocity limits | Max score per time period        |
| Geographic validation | Flag impossible location changes |

### 9.4 Future Considerations

1. Sharding: Partition users across multiple databases for scale
2. Event Sourcing: Store all events for replay and analysis
3. Circuit Breakers: Prevent cascade failures
4. Canary Deployments: Gradual rollout of changes
5. A/B Testing: Test different scoring algorithms

---

## 10. Implementation Checklist

For the backend engineering team:

- [ ] Set up PostgreSQL with schema
- [ ] Set up Redis for caching and pub/sub
- [ ] Implement JWT authentication
- [ ] Implement action token generation
- [ ] Implement action token validation
- [ ] Implement rate limiting middleware
- [ ] Create REST API endpoints
- [ ] Set up WebSocket server
- [ ] Implement Redis pub/sub for broadcasts
- [ ] Add audit logging
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Load testing
- [ ] Security audit
- [ ] Deploy to staging
- [ ] Monitor and iterate

---

## Appendix: Generating Diagrams

### Using PlantUML CLI

```bash
# Install (requires Java)
# Download from: https://plantuml.com/download

# Generate PNG
java -jar plantuml.jar diagrams/architecture.puml

# Generate SVG
java -jar plantuml.jar -tsvg diagrams/architecture.puml

# Generate all diagrams
java -jar plantuml.jar diagrams/*.puml
```

### Using Docker

```bash
docker run -v $(pwd)/diagrams:/data plantuml/plantuml /data/*.puml
```

### VS Code Extension

Install "PlantUML" extension (jebbs.plantuml) for live preview.
