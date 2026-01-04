const express = require('express');
const { body, validationResult } = require('express-validator');
const { Company } = require('../models');

const router = express.Router();

// Create company
router.post('/', [
  body('name').notEmpty().withMessage('Company name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { name, industry, website } = req.body;
    const company = await Company.create({ name, industry, website });
    return res.status(201).json(company);
  } catch (error) {
    console.error('Company creation error:', error);
    return res.status(500).json({ message: 'Company creation failed', error: error.message });
  }
});

// List companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.findAll();
    return res.json(companies);
  } catch (error) {
    console.error('List companies error:', error);
    return res.status(500).json({ message: 'Failed to list companies', error: error.message });
  }
});

module.exports = router;
