# Job Application Tracking System (ATS) API

## Overview

This project is a **Node.js and Express.js based Job Application Tracking System (ATS) backend API** developed for evaluation and learning purposes.

The system focuses on implementing **core ATS workflow logic**, including job postings, application submission, workflow stage transitions, role-based access control (RBAC), and audit logging.

Some infrastructure-heavy components (such as background workers, advanced scalability, and enterprise-grade security) are implemented in a **simplified form** to keep the project easy to review and run locally during evaluation.

---

## Key Objectives

- Demonstrate backend API design using Node.js and Express
- Implement workflow-based business logic using a state machine
- Enforce Role-Based Access Control (RBAC)
- Track application stage changes with audit history
- Illustrate the concept of asynchronous processing

---

## User Roles

### Candidate
- Register and log in
- View available jobs
- Apply for jobs
- View own applications and current stage

### Recruiter
- Create job postings
- View applications for company jobs
- Move applications through workflow stages

### Hiring Manager
- View applications for company jobs  
  *(Limited access in current implementation)*

---

## Architecture Overview

The application follows a **simple layered structure**:

Client (Postman / Browser)  
→ Express.js API  
→ Routes & Middleware  
→ Services (Workflow Logic)  
→ Models (Database Schemas)

Design notes:
- Business logic is implemented directly within route handlers for simplicity.
- A separate workflow service defines valid application stage transitions.
- Asynchronous processing is demonstrated using a simplified approach.

---

## Workflow State Machine

Applications follow a predefined workflow:

Applied → Screening → Interview → Offer → Hired

- `Rejected` can be reached from any non-terminal stage.
- `Hired` and `Rejected` are terminal states.
- Invalid transitions are blocked by validation logic.

Examples:
- Applied → Interview ❌ (blocked)
- Screening → Interview ✅
- Any stage → Rejected ✅

---

## Role-Based Access Control (RBAC)

| Endpoint | Allowed Roles |
|--------|--------------|
| POST /auth/register | All |
| POST /auth/login | All |
| GET /jobs | All |
| POST /jobs | Recruiter |
| POST /applications/:jobId | Candidate |
| GET /applications/my-applications | Candidate |
| GET /applications/job/:jobId | Recruiter |
| PUT /applications/:id/stage | Recruiter |

RBAC is enforced using middleware based on the authenticated user’s role.

---

## Data Models Summary

### User
- id
- email
- password
- role (candidate, recruiter, hiring_manager)
- companyId

### Job
- id
- title
- description
- status
- companyId

### Application
- id
- candidateId
- jobId
- stage

### ApplicationHistory
- id
- applicationId
- fromStage
- toStage
- changedBy
- timestamp

---

## Asynchronous Email Processing (Simplified)

The project includes a **demonstration of asynchronous email handling**:

- Email sending is triggered after key events (application submission, stage change).
- The current implementation uses a simplified, in-memory mechanism to simulate background processing.
- This avoids external infrastructure dependencies during evaluation.

Note:  
In a production system, this would be replaced with a persistent message queue (e.g., Redis + BullMQ) and a dedicated worker process.

---

## Installation & Setup

### Prerequisites
- Node.js (v16 or above)
- MongoDB (local instance)

### Steps
npm install  
npm start  

### Verify
GET http://localhost:3000/health

---

## Environment Variables

The following values are used in the current setup:

PORT=3000  
JWT_SECRET=example_secret  
MONGO_URI=mongodb://localhost:27017/ats_db  

Security Note:  
Secrets are simplified for evaluation purposes.  
In a production system, all secrets should be managed using environment variables or a secret manager.

---

## API Endpoints

### Authentication
- POST /auth/register
- POST /auth/login

### Jobs
- GET /jobs
- POST /jobs

### Applications
- POST /applications/:jobId
- GET /applications/my-applications
- GET /applications/job/:jobId
- PUT /applications/:id/stage

---

## Limitations

- Job update and delete endpoints are not implemented.
- Hiring manager role has limited permissions.
- Asynchronous email processing is simplified and not persistent.
- Database operations are not wrapped in transactions.
- Minimal automated test coverage.

These limitations are intentional to keep the implementation focused on core workflow logic.

---

## Design Trade-offs

- Prioritized workflow correctness over infrastructure completeness.
- Used a monolithic structure to reduce boilerplate.
- Simplified background processing to avoid external dependencies during evaluation.

---

## Future Improvements

- Full CRUD operations for jobs
- Persistent background job queue
- Database transactions
- Improved automated test coverage
- Pagination and filtering
- Production-grade security configuration

---

## Final Note

This project is an **evaluation-focused backend implementation** demonstrating core ATS concepts such as workflow enforcement, RBAC, and audit logging.

It is designed to be easy to understand, review, and extend.

---

## License

MIT
