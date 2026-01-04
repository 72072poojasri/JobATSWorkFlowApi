const express = require('express');
const { body, validationResult, query } = require('express-validator');
const ApplicationService = require('../services/applicationService');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/rbacMiddleware');
const { Application, Job } = require('../models');

const router = express.Router();

// Submit application (candidate only)
router.post('/submit', authMiddleware, requireRole('candidate'), [
  body('jobId').notEmpty(),
  body('resumeUrl').notEmpty(),
  body('coverLetter').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, resumeUrl, coverLetter } = req.body;
    const application = await ApplicationService.submitApplication(
      req.user.userId,
      jobId,
      resumeUrl,
      coverLetter
    );

    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change application stage (recruiter/hiring_manager only)
router.put('/:applicationId/stage', authMiddleware, requireRole('recruiter', 'hiring_manager'), [
  body('newStage').notEmpty().isIn(['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']),
  body('reason').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newStage, reason } = req.body;
    const application = await Application.findByPk(req.params.applicationId, {
      include: [{ association: 'job' }],
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify authorization: recruiter must be from same company
    const job = await Job.findByPk(application.jobId);
    if (req.user.role === 'recruiter' && job.companyId !== req.user.companyId) {
      return res.status(403).json({ error: 'You can only manage applications for your company' });
    }

    const updatedApplication = await ApplicationService.changeApplicationStage(
      req.params.applicationId,
      newStage,
      req.user.userId,
      reason
    );

    res.json(updatedApplication);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get application by ID
router.get('/:applicationId', authMiddleware, async (req, res) => {
  try {
    const application = await ApplicationService.getApplicationById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify authorization
    const isCandidate = application.candidateId === req.user.userId;
    const isRecruiter = req.user.role === 'recruiter' && application.job.companyId === req.user.companyId;
    const isHiringManager = req.user.role === 'hiring_manager';

    if (!isCandidate && !isRecruiter && !isHiringManager) {
      return res.status(403).json({ error: 'You do not have permission to view this application' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get applications for a job (recruiter only)
router.get('/job/:jobId/applications', authMiddleware, requireRole('recruiter'), [
  query('stage').optional().isIn(['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findByPk(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify recruiter belongs to company
    if (job.companyId !== req.user.companyId) {
      return res.status(403).json({ error: 'You can only view applications for your company' });
    }

    const { stage } = req.query;
    const applications = await ApplicationService.getApplicationsByJobId(req.params.jobId, stage);

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get candidate's applications
router.get('/my-applications', authMiddleware, requireRole('candidate'), async (req, res) => {
  try {
    const applications = await ApplicationService.getCandidateApplications(req.user.userId);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
