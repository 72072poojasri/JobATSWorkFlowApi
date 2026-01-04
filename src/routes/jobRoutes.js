const express = require('express');
const { body, validationResult } = require('express-validator');
const { Job } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/rbacMiddleware');

const router = express.Router();

// Create job (recruiter only)
router.post('/', authMiddleware, requireRole('recruiter'), [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('companyId').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, companyId } = req.body;

    // Verify recruiter belongs to company
    if (req.user.companyId !== companyId) {
      return res.status(403).json({ error: 'You can only create jobs for your company' });
    }

    const job = await Job.create({
      title,
      description,
      companyId,
      createdBy: req.user.userId,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [{ association: 'company' }],
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job by ID
router.get('/:jobId', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId, {
      include: [{ association: 'company' }],
    });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update job (recruiter only)
router.put('/:jobId', authMiddleware, requireRole('recruiter'), [
  body('title').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('status').optional().isIn(['open', 'closed']),
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

    // Verify recruiter created the job
    if (job.createdBy !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update jobs you created' });
    }

    const { title, description, status } = req.body;
    if (title) job.title = title;
    if (description) job.description = description;
    if (status) job.status = status;

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete job (recruiter only)
router.delete('/:jobId', authMiddleware, requireRole('recruiter'), async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify recruiter created the job
    if (job.createdBy !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete jobs you created' });
    }

    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
