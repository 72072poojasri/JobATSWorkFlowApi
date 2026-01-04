const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/authService');

const router = express.Router();

/**
 * ============================
 * REGISTER
 * ============================
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required'),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),

    body('firstName')
      .notEmpty()
      .withMessage('First name is required'),

    body('lastName')
      .notEmpty()
      .withMessage('Last name is required'),

    body('role')
      .isIn(['candidate', 'recruiter', 'hiring_manager'])
      .withMessage('Role must be candidate, recruiter, or hiring_manager'),

    body('companyId')
      .optional()
      .isInt()
      .withMessage('Company ID must be a number'),
  ],
  async (req, res) => {
    // 🔴 VALIDATION CHECK
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    try {
      const { email, password, firstName, lastName, role, companyId } = req.body;

      const result = await AuthService.registerUser(
        email,
        password,
        firstName,
        lastName,
        role,
        companyId
      );

      return res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      console.error('🔴 ROUTE ERROR:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(400).json({
        message: 'Registration failed',
        error: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
);

/**
 * ============================
 * LOGIN
 * ============================
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required'),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    try {
      const { email, password } = req.body;

      const result = await AuthService.loginUser(email, password);

      return res.json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      return res.status(401).json({
        message: 'Login failed',
        error: error.message || 'Invalid credentials',
      });
    }
  }
);

module.exports = router;    