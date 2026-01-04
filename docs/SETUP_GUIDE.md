# Local Development Setup Guide – ATS Workflow API

This guide explains how to set up and run the ATS Workflow API locally on a Windows system.

---

## Quick Start (5 Minutes)

### Prerequisites

Make sure the following are installed and available in PATH:

```bash
node --version      # Node.js v16+
npm --version
psql --version      # PostgreSQL
redis-cli --version # Redis
```

---

## Step 1: Install Project Dependencies

```bash
cd C:\Users\prasa\OneDrive\Documents\JobATSWorkflowAPI
npm install
```

Expected output:
```
added 480 packages in 26s
```

---

## Step 2: Environment Configuration

The `.env` file is already configured for local development.

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://postgres:password@localhost:5432/ats_db
REDIS_URL=redis://localhost:6379

JWT_SECRET=dev_jwt_secret_key_123456789

SENDGRID_API_KEY=SG.test_key_123456789
SENDGRID_FROM_EMAIL=noreply@ats-system.com

WORKER_CONCURRENCY=5
```

---

## Step 3: PostgreSQL Setup

### Start PostgreSQL

```bash
pg_ctl -D "C:\Program Files\PostgreSQL\data" start
```

### Create Databases

```bash
psql -U postgres
```

```sql
CREATE DATABASE ats_db;
CREATE DATABASE ats_db_test;
```

Verify:
```sql
\l
\q
```

---

## Step 4: Start Redis Server

```bash
redis-server
```

Verify connection:
```bash
redis-cli ping
# PONG
```

---

## Step 5: Start API Server

```bash
npm run dev
```

Expected output:
```
✓ ATS API running on http://localhost:3000
```

---

## Step 6: Start Email Worker

Open a new terminal:

```bash
npm run worker
```

Expected output:
```
Email Worker Started
Listening for email jobs...
```

---

## Step 7: Verify API Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ATS API is running",
  "environment": "development"
}
```

---

## Common Issues & Fixes

### PostgreSQL Connection Error

Error:
```
ECONNREFUSED 127.0.0.1:5432
```

Fix:
```bash
pg_ctl -D "C:\Program Files\PostgreSQL\data" start
psql -U postgres -l
```

---

### Redis Connection Error

Error:
```
ECONNREFUSED 127.0.0.1:6379
```

Fix:
```bash
redis-server
redis-cli ping
```

---

### Port 3000 Already in Use

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change the port in `.env`.

---

## Development Workflow

```bash
# Terminal 1
redis-server

# Terminal 2
npm run dev

# Terminal 3
npm run worker
```

---

## API Testing (cURL)

### Register User

```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d '{
  "email": "candidate@example.com",
  "password": "testPass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "candidate"
}'
```

---

### Login User

```bash
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "candidate@example.com",
  "password": "testPass123"
}'
```

---

## Running Tests

```bash
npm test
npm run test:watch
```

Expected output:
```
Tests: 8 passed, 8 total
```

---

## Database Management

```bash
psql -U postgres -d ats_db
\dt
SELECT * FROM "Users";
SELECT * FROM "Jobs";
SELECT * FROM "Applications";
\q
```

Reset database (development only):

```bash
DROP DATABASE ats_db;
CREATE DATABASE ats_db;
```

---

## Redis Commands

```bash
redis-cli
KEYS *
LLEN email-notifications
FLUSHALL
exit
```

---

## VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "ATS API",
      "program": "${workspaceFolder}/src/server.js",
      "restart": true
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Email Worker",
      "program": "${workspaceFolder}/src/workers/startWorker.js"
    }
  ]
}
```

---

## Status

✅ Local setup completed  
✅ API server running  
✅ Email worker running  
✅ Ready for testing & submission  

**Version:** 1.1.0  
**Last Updated:** December 2024
