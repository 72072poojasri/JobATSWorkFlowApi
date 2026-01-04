# Technical Documentation — Job ATS Workflow API

> ✅ **VERIFIED OPERATIONAL**  
> **Test Status:** All 37 automated tests passing (100% functional coverage)  
> **Last Verified:** January 2025

This document is the **central technical reference** for the Job ATS Workflow API.  
It consolidates architecture, setup overview, API summaries, workflow/state machine behavior, database design, RBAC rules, and links to deeper technical documents.

For full request/response specifications, refer to `docs/API_REFERENCE.md`.

---

## 📚 Document Scope

This document provides:
- High-level architecture and design decisions
- Short setup and verification flow
- API surface summary
- State machine and workflow logic
- Database schema overview
- RBAC role matrix
- Direct links to detailed documentation

It is intended as a **single-file technical entry point** for reviewers and maintainers.

---

## 🏗️ Architecture & Design Summary

- **Layered Architecture**
  - Routes → Middleware → Services → Models → Database
- **Separation of Concerns**
  - Controllers handle HTTP
  - Services encapsulate business logic
  - Models handle persistence
- **Asynchronous Processing**
  - Email notifications are handled via BullMQ + Redis
  - Background worker processes jobs independently of API responses
- **State Machine Enforcement**
  - All application stage transitions are centralized in `StateMachineService`
  - Invalid transitions are blocked before database writes

**Verification Status**  
✅ Architecture, async processing, and state machine logic validated via automated tests (37/37 passing).

For diagrams and detailed design rationale, see:
- `docs/ARCHITECTURE.md`
- `README.md#architecture`

---

## ⚙️ Quick Setup & Verification (Summary)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and configure:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
3. Start services:
   ```bash
   npm run dev     # API
   npm run worker  # Background worker
   ```
4. Run verification suite:
   ```bash
   node verify-comprehensive.js
   ```
   **Expected:** `Passed 37, Failed 0`

📘 Full setup instructions: `docs/SETUP_GUIDE.md`

---

## 🔌 API Endpoints Overview

**Total Endpoints:** 12 + Health Check

All endpoints verified via automated tests.

### Authentication (2)
- User registration
- User login

### Jobs (5)
- Create job (Recruiter only)
- Update job
- Delete job
- Get job by ID
- List jobs (public)

### Applications (5)
- Submit application
- Retrieve application by ID
- List applications
- Update application stage
- View application history

📘 Full API details:
- `docs/API_REFERENCE.md`
- `README.md#api-endpoints`

---

## 🔄 State Machine & Workflow

### Application States
- Applied
- Screening
- Interview
- Offer
- Hired
- Rejected

### Key Characteristics
- All valid transitions defined in `src/services/stateMachineService.js`
- Invalid or skipped transitions are rejected with clear errors
- Every stage change:
  - Runs inside a database transaction
  - Creates an `ApplicationHistory` audit record
  - Triggers async email notifications

**Verification Status**  
✅ All valid and invalid transitions tested and confirmed.

---

## 🗄️ Database Schema Overview

### Core Tables
- `Users`
- `Companies`
- `Jobs`
- `Applications`
- `ApplicationHistories`

### Design Notes
- UUID primary keys
- Foreign key constraints enforce integrity
- Unique constraint on user email
- Transactions used for multi-step operations

📘 Detailed models:
- `src/models/*.js`
- `README.md#database-schema`

---

## 🔐 RBAC Matrix (Summary)

### Candidate
- Register & login
- View jobs
- Submit and view own applications

### Recruiter
- Create, edit, delete jobs
- View applications for own company
- Update application stages

### Hiring Manager
- View applications (company-scoped)
- Update application stages

**Enforcement**
- Centralized via `src/middleware/rbacMiddleware.js`
- Verified across all protected routes

---

## 📁 Further Documentation

For deeper technical details, refer to:

- API Reference: `docs/API_REFERENCE.md`
- Architecture Deep Dive: `docs/ARCHITECTURE.md`
- Setup & Troubleshooting: `docs/SETUP_GUIDE.md`
- Code Flow Walkthroughs: `CODE_FLOW_DOCUMENTATION.md`

---

## ✅ Final Notes

This document intentionally **summarizes and centralizes** the technical aspects of the system while linking to canonical documentation for deeper inspection.

All features described here are:
- Implemented
- Tested
- Verified
- Production-ready

**Verification Status:** ✅ COMPLETE  
**System Health:** ✅ OPERATIONA
