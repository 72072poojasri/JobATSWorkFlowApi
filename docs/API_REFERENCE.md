# API Reference

## Base URL
http://localhost:3000

## Authentication

All protected endpoints require the following header:

Authorization: Bearer {token}

JWT token is returned from:
- POST /auth/login
- POST /auth/register

---

## Endpoints Summary

Method | Endpoint | Protected | Roles | Purpose
POST | /auth/register | No | All | Register new user
POST | /auth/login | No | All | Login user
GET | /jobs | No | All | List all jobs
GET | /jobs/:jobId | No | All | Get job details
POST | /jobs | Yes | recruiter | Create job
PUT | /jobs/:jobId | Yes | recruiter | Update job
DELETE | /jobs/:jobId | Yes | recruiter | Delete job
POST | /applications/submit | Yes | candidate | Submit application
PUT | /applications/:id/stage | Yes | recruiter, hiring_manager | Change application stage
GET | /applications/:id | Yes | candidate, recruiter, hiring_manager | Get application details
GET | /applications/job/:jobId/applications | Yes | recruiter | List job applications
GET | /applications/my-applications | Yes | candidate | Get my applications
GET | /health | No | All | Health check

---

## Authentication Endpoints

### Register User

POST /auth/register

Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "candidate",
  "companyId": null
}

Validations:
- email must be valid
- password minimum 6 characters
- role must be candidate | recruiter | hiring_manager
- companyId required for recruiter and hiring_manager

Success Response (201):
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "candidate"
  }
}

Errors:
400 Email already registered
400 Validation error

---

### Login User

POST /auth/login

Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Success Response (200):
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "candidate"
  }
}

Error:
401 Invalid email or password

---

## Job Endpoints

### Create Job (Recruiter Only)

POST /jobs

Headers:
Authorization: Bearer {token}

Request Body:
{
  "title": "Senior Backend Engineer",
  "description": "Looking for Node.js developer",
  "companyId": "company_uuid"
}

Success Response (201):
{
  "id": "job_uuid",
  "title": "Senior Backend Engineer",
  "description": "...",
  "status": "open",
  "companyId": "company_uuid",
  "createdBy": "recruiter_uuid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}

Errors:
401 Unauthorized
403 Not recruiter
403 Wrong company
400 Validation error

---

### Get All Jobs

GET /jobs

Public endpoint.

Success Response (200):
[
  {
    "id": "job_uuid",
    "title": "Senior Backend Engineer",
    "status": "open",
    "company": {
      "id": "company_uuid",
      "name": "TechCorp"
    }
  }
]

---

### Get Job Details

GET /jobs/{jobId}

Success Response (200):
{
  "id": "job_uuid",
  "title": "Senior Backend Engineer",
  "description": "...",
  "status": "open",
  "company": { ... }
}

Error:
404 Job not found

---

### Update Job (Recruiter – Own Job Only)

PUT /jobs/{jobId}

Request Body (optional):
{
  "title": "Updated title",
  "status": "closed"
}

Success Response (200):
Updated job object

Errors:
403 Not your job
404 Job not found

---

### Delete Job (Recruiter – Own Job Only)

DELETE /jobs/{jobId}

Success Response (200):
{
  "message": "Job deleted successfully"
}

---

## Application Endpoints

### Submit Application (Candidate Only)

POST /applications/submit

Request Body:
{
  "jobId": "job_uuid",
  "resumeUrl": "https://example.com/resume.pdf",
  "coverLetter": "Interested in this role"
}

Success Response (201):
{
  "id": "application_uuid",
  "jobId": "job_uuid",
  "candidateId": "candidate_uuid",
  "stage": "Applied"
}

Side Effects:
- Confirmation email to candidate
- Notification email to recruiter
- ApplicationHistory created

Errors:
400 Job not found or closed
400 Duplicate application
403 Not candidate role

---

### Change Application Stage

PUT /applications/{applicationId}/stage

Request Body:
{
  "newStage": "Screening",
  "reason": "Resume reviewed"
}

Valid Stages:
Applied, Screening, Interview, Offer, Hired, Rejected

Success Response (200):
Updated application object

Side Effects:
- Email sent to candidate
- ApplicationHistory entry created

Errors:
400 Invalid transition
403 Wrong company
404 Application not found

---

### Get Application Details

GET /applications/{applicationId}

Success Response (200):
{
  "id": "application_uuid",
  "stage": "Screening",
  "candidate": { ... },
  "job": { ... },
  "history": [ ... ]
}

Errors:
403 No permission
404 Application not found

---

### Get Job Applications (Recruiter Only)

GET /applications/job/{jobId}/applications?stage=Screening

Success Response (200):
[
  {
    "id": "application_uuid",
    "stage": "Screening",
    "candidate": { ... }
  }
]

Errors:
403 Wrong company
404 Job not found

---

### Get My Applications (Candidate Only)

GET /applications/my-applications

Success Response (200):
[
  {
    "id": "application_uuid",
    "stage": "Screening",
    "job": { ... }
  }
]

---

## System Endpoints

### Health Check

GET /health

Success Response (200):
{
  "status": "ATS API is running",
  "environment": "development",
  "timestamp": "ISO_TIMESTAMP"
}

---

## Error Handling

Standard Error Format:
{
  "error": "Human readable message",
  "details": "Optional info"
}

HTTP Status Codes:
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error

---

## Rate Limiting

100 requests per 15 minutes per IP

Headers:
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset

On limit exceeded:
429 Too Many Requests

---

## Validation Rules

Email: valid email format  
Password: minimum 6 characters  
UUID: standard UUID v4  
Roles: candidate | recruiter | hiring_manager  
Job Status: open | closed  
Application Stage: Applied | Screening | Interview | Offer | Hired | Rejected  

---


API Reference Version: 1.0.0  
Last Updated: December 14, 2024  
Status: Complete
