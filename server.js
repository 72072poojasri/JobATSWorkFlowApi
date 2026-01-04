const express = require("express");

const app = express();
app.use(express.json());

/* ===============================
   DEBUG LOGGER
================================ */
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

/* ===============================
   SIMPLE RBAC MIDDLEWARE
================================ */
function requireRole(role) {
  return (req, res, next) => {
    const userRole = req.headers["x-role"];

    if (!userRole) {
      return res.status(401).json({ message: "Role header missing" });
    }

    if (userRole !== role) {
      return res.status(403).json({
        message: "Access denied",
        requiredRole: role
      });
    }

    next();
  };
}

/* ===============================
   HEALTH & ROOT
================================ */
app.get("/", (req, res) => {
  res.send("ATS API running");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ===============================
   AUTH (DUMMY LOGIN)
================================ */
app.post("/auth/login", (req, res) => {
  res.json({
    token: "dummy-jwt-token",
    note: "Use x-role header for RBAC (CANDIDATE / RECRUITER)"
  });
});

/* ===============================
   JOBS
================================ */
app.get("/jobs", (req, res) => {
  res.json([
    { id: 1, title: "Software Engineer", status: "OPEN" }
  ]);
});

app.post("/jobs", requireRole("RECRUITER"), (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Job title required" });
  }

  res.status(201).json({
    message: "Job created",
    job: { id: 2, title }
  });
});

/* ===============================
   APPLICATION WORKFLOW
================================ */

/* Valid state machine */
const VALID_TRANSITIONS = {
  APPLIED: ["SCREENING"],
  SCREENING: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFER", "REJECTED"],
  OFFER: ["HIRED", "REJECTED"],
  HIRED: [],
  REJECTED: []
};

/* In-memory application store (demo) */
const applications = {
  1: { stage: "APPLIED" }
};

/* Submit application (CANDIDATE only) */
app.post(
  "/applications/submit",
  requireRole("CANDIDATE"),
  (req, res) => {
    res.status(201).json({
      message: "Application submitted",
      stage: "APPLIED"
    });
  }
);

/* Change application stage (RECRUITER only) */
app.put(
  "/applications/:id/stage",
  requireRole("RECRUITER"),
  (req, res) => {
    const appId = req.params.id;
    const { stage: newStage } = req.body;

    if (!newStage) {
      return res.status(400).json({ message: "Stage is required" });
    }

    const application = applications[appId];
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const currentStage = application.stage;
    const allowed = VALID_TRANSITIONS[currentStage] || [];

    if (!allowed.includes(newStage)) {
      return res.status(400).json({
        message: "Invalid stage transition",
        from: currentStage,
        to: newStage,
        allowed
      });
    }

    application.stage = newStage;

    res.json({
      id: appId,
      previousStage: currentStage,
      newStage
    });
  }
);

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log("ATS API STARTED");
  console.log("PORT:", PORT);
  console.log("=================================");
});
