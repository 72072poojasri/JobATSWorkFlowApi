# Architecture & Design Document

## System Overview

The Job Application Tracking System (ATS) is a backend API designed to manage the complete job application lifecycle using a state machine workflow, asynchronous processing, and role-based access control.

---

## Architectural Layers

### 1. Presentation Layer (Routes)

src/routes/
- authRoutes.js        # Authentication endpoints
- jobRoutes.js         # Job CRUD endpoints
- applicationRoutes.js # Application workflow endpoints

Responsibilities:
- Parse HTTP requests
- Validate input using express-validator
- Delegate requests to services
- Format HTTP responses
- Handle route-level errors

Key Pattern:
router.post(
  "/submit",
  authMiddleware,
  requireRole("candidate"),
  [validation],
  async (req, res) => {
    // Route handler
  }
);

---

### 2. Business Logic Layer (Services)

src/services/
- authService.js            # Authentication logic
- applicationService.js     # Application business logic
- stateMachineService.js    # Workflow state rules

Responsibilities:
- Core business logic
- Workflow enforcement
- Data validation & transformation
- Transaction coordination
- Error handling

Example:
async submitApplication(candidateId, jobId, resumeUrl, coverLetter) {
  // Verify job exists
  // Check duplicate application
  // Create application (transaction)
  // Create history entry
  // Queue email notifications
  return application;
}

---

### 3. Data Access Layer (Models)

src/models/
- User.js
- Company.js
- Job.js
- Application.js
- ApplicationHistory.js
- index.js (associations)

Responsibilities:
- Sequelize model definitions
- Table relationships
- Query helpers
- Schema validation

ORM Used: Sequelize

---

### 4. Middleware Layer

src/middleware/
- authMiddleware.js  # JWT verification
- rbacMiddleware.js  # Role-based access control

Middleware Stack Order:
1. helmet() – Security headers
2. cors() – Cross-origin access
3. express.json() – Request parsing
4. rateLimit() – DDoS protection
5. authMiddleware – JWT validation
6. rbacMiddleware – Role enforcement

---

### 5. Supporting Services

Configuration Layer:
src/config/
- database.js        # PostgreSQL connection
- redis.js           # Redis connection
- initializeDatabase.js

Worker Layer:
src/workers/
- emailQueue.js      # BullMQ queue
- emailWorker.js     # Worker logic
- startWorker.js     # Worker bootstrap

---

## Data Flow Diagrams

### Authentication Flow

Client Request
→ authRoutes.post('/login')
→ AuthService.loginUser()
  - Fetch user
  - Compare password hash
  - Generate JWT
→ Response with token & user data
→ Client stores token

---

### Application Submission Flow

Client → POST /applications/submit
→ authMiddleware
→ requireRole(candidate)
→ Input validation
→ ApplicationService.submitApplication()
  - Transaction START
  - Validate job
  - Check duplicate
  - Create application
  - Create ApplicationHistory
  - Transaction COMMIT
→ Queue emails (candidate + recruiter)
→ Response 201
→ Email Worker sends emails asynchronously

---

### State Transition Flow

Client → PUT /applications/:id/stage
→ authMiddleware + rbac
→ Fetch application
→ StateMachineService.isValidTransition()
→ If valid:
  - Transaction START
  - Update stage
  - Create history
  - Transaction COMMIT
  - Queue email
  - Response 200
→ If invalid:
  - Response 400

---

## Database Schema & Relationships

Users:
- Stores all users
- Passwords hashed with bcrypt
- companyId links recruiters to company

Companies:
- Hiring organizations
- One-to-many with users and jobs

Jobs:
- Created by recruiters
- Linked to company
- Status: open / closed

Applications:
- One per candidate per job
- stage: Applied, Screening, Interview, Offer, Hired, Rejected

ApplicationHistory:
- Complete audit trail
- Records all stage transitions

Indexes:
UNIQUE(candidateId, jobId)
INDEX Applications(stage)
INDEX Applications(candidateId)
INDEX Jobs(companyId)
INDEX Users(companyId)

---

## Security Architecture

Authentication:
- bcryptjs for password hashing
- JWT for stateless auth
- Token expiry: 24 hours
- Authorization header: Bearer {token}

Authorization Flow:
Protected Route
→ JWT verification
→ Role validation
→ Company/resource ownership check
→ Access granted or 403

Multi-Tenancy Enforcement:
If req.user.companyId !== resource.companyId → 403 Forbidden

Sensitive Data Protection:
- Password never returned in API response
- Explicit attribute selection in queries

Network Security:
- Helmet (HSTS, CSP, XSS protection)
- CORS restrictions
- Rate limiting: 100 req / 15 min / IP
- Input validation on all endpoints

---

## Asynchronous Processing

Queue Architecture:
Redis (BullMQ)
- send-application-confirmation
- send-new-application-notification
- send-stage-change-notification

Worker:
- Polls Redis
- Concurrency: 5
- Uses SendGrid
- Retries with exponential backoff

Job Lifecycle:
1. Job added to queue
2. Worker processes job
3. Success → remove job
4. Failure → retries (2s, 4s, 8s)
5. After 3 failures → dead letter queue

Benefits:
- Non-blocking API
- Reliable retries
- Horizontal scalability
- Fault tolerance

---

## State Machine Workflow

VALID_TRANSITIONS:
Applied → Screening | Rejected
Screening → Interview | Rejected
Interview → Offer | Rejected
Offer → Hired | Rejected
Hired → (terminal)
Rejected → (terminal)

Rules:
- No skipping stages
- No backward transitions
- Rejection allowed at any stage before terminal
- Hired & Rejected are terminal states

---

## Error Handling Strategy

HTTP Status Codes:
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error

Error Response Format:
{
  "error": "Human-readable message",
  "details": "Optional context"
}

Global Error Handler:
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

---

## Testing Strategy

Unit Tests:
- stateMachine.test.js (workflow validation)
- rbac.test.js (role enforcement)

Integration Tests:
- Planned for full API flow & queue testing

Run Tests:
npm test
npm run test:watch

---

## Deployment Considerations

Environment Config:
- dev: local DB, verbose logs
- staging: PostgreSQL
- prod: PostgreSQL, minimal logs

Migrations:
- Sequelize migrations (future)

Monitoring (Future):
- Winston / Pino logging
- Sentry error tracking
- ELK / Datadog

---

## Performance Optimization

Current:
- PostgreSQL connection pooling
- Indexed queries
- Transactions for critical operations
- Async email processing

Future:
- Redis caching
- Pagination
- Full-text search
- GraphQL
- CDN integration

---

## Monitoring & Observability

Health Endpoint:
GET /health

Metrics (Future):
- Latency
- Error rate
- Queue depth
- Worker throughput
- DB performance

---

## Version History

1.0.0 – 2024-12-14 – Initial release

Document Version: 1.0.0  
Last Updated: December 14, 2024  
Status: Complete


