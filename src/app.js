// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');

// const authRoutes = require('./routes/authRoutes');
// const jobRoutes = require('./routes/jobRoutes');
// const applicationRoutes = require('./routes/applicationRoutes');
// const companyRoutes = require('./routes/companyRoutes');

// const app = express();

// // Global middleware
// app.use(helmet());
// app.use(cors());
// app.use(express.json());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'ATS API is running',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // API Routes
// app.use('/auth', authRoutes);
// app.use('/jobs', jobRoutes);
// app.use('/applications', applicationRoutes);
// app.use('/companies', companyRoutes);

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ error: 'Endpoint not found' });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(err.status || 500).json({ 
//     error: err.message || 'Internal server error'
//   });
// });

// module.exports = app;
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* Health check */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* Auth */
app.post("/auth/register", (req, res) => {
  res.json({ message: "User registered (dummy)" });
});

app.post("/auth/login", (req, res) => {
  res.json({ token: "dummy-jwt-token" });
});

/* Jobs */
app.get("/jobs", (req, res) => {
  res.json([{ id: 1, title: "Software Engineer" }]);
});

app.post("/jobs", (req, res) => {
  res.json({ message: "Job created" });
});

/* Applications */
app.post("/applications/submit", (req, res) => {
  res.json({ message: "Application submitted" });
});

app.put("/applications/:id/stage", (req, res) => {
  res.json({ message: "Stage updated" });
});

module.exports = app;
