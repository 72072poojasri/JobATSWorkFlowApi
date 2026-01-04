#!/usr/bin/env node
/**
 * Project Verification Script
 * Verifies that all modules and files are properly configured
 */

console.log('🔍 Starting ATS API Project Verification...\n');

const tests = [];
let passed = 0;
let failed = 0;

function addTest(name, testFn) {
  tests.push({ name, testFn });
}

function runTests() {
  tests.forEach(({ name, testFn }) => {
    try {
      testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    }
  });

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Tests: ${passed} passed, ${failed} failed, ${tests.length} total`);
  console.log(`${'='.repeat(50)}\n`);

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('✅ All verification tests passed! Project is ready.');
    process.exit(0);
  }
}

// Test 1: Environment variables
addTest('Environment variables configured', () => {
  require('dotenv').config();
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  if (!process.env.REDIS_URL) throw new Error('REDIS_URL not set');
});

// Test 2: Express app can be required
addTest('Express app can be imported', () => {
  const app = require('./src/app');
  if (!app) throw new Error('app.js did not export Express app');
  if (typeof app !== 'object') throw new Error('app is not an object');
});

// Test 3: All models can be imported
addTest('All models can be imported', () => {
  const { User, Company, Job, Application, ApplicationHistory } = require('./src/models');
  if (!User) throw new Error('User model not exported');
  if (!Company) throw new Error('Company model not exported');
  if (!Job) throw new Error('Job model not exported');
  if (!Application) throw new Error('Application model not exported');
  if (!ApplicationHistory) throw new Error('ApplicationHistory model not exported');
});

// Test 4: All services can be imported
addTest('All services can be imported', () => {
  const AuthService = require('./src/services/authService');
  const ApplicationService = require('./src/services/applicationService');
  const StateMachineService = require('./src/services/stateMachineService');
  
  if (!AuthService) throw new Error('AuthService not exported');
  if (!ApplicationService) throw new Error('ApplicationService not exported');
  if (!StateMachineService) throw new Error('StateMachineService not exported');
});

// Test 5: All route modules can be imported
addTest('All route modules can be imported', () => {
  const authRoutes = require('./src/routes/authRoutes');
  const jobRoutes = require('./src/routes/jobRoutes');
  const applicationRoutes = require('./src/routes/applicationRoutes');
  
  if (!authRoutes) throw new Error('authRoutes not exported');
  if (!jobRoutes) throw new Error('jobRoutes not exported');
  if (!applicationRoutes) throw new Error('applicationRoutes not exported');
});

// Test 6: Middleware can be imported
addTest('Middleware can be imported', () => {
  const authMiddleware = require('./src/middleware/authMiddleware');
  const requireRole = require('./src/middleware/rbacMiddleware');
  
  if (!authMiddleware) throw new Error('authMiddleware not exported');
  if (typeof authMiddleware !== 'function') throw new Error('authMiddleware is not a function');
  if (!requireRole) throw new Error('rbacMiddleware not exported');
  if (typeof requireRole !== 'function') throw new Error('rbacMiddleware is not a function');
});

// Test 7: Email queue can be imported
addTest('Email queue can be imported', () => {
  const emailQueue = require('./src/workers/emailQueue');
  if (!emailQueue) throw new Error('emailQueue not exported');
});

// Test 8: Static methods on services exist
addTest('AuthService has required methods', () => {
  const AuthService = require('./src/services/authService');
  if (typeof AuthService.registerUser !== 'function') throw new Error('registerUser method missing');
  if (typeof AuthService.loginUser !== 'function') throw new Error('loginUser method missing');
  if (typeof AuthService.generateToken !== 'function') throw new Error('generateToken method missing');
  if (typeof AuthService.verifyToken !== 'function') throw new Error('verifyToken method missing');
});

// Test 9: StateMachine methods work
addTest('StateMachineService methods work', () => {
  const StateMachineService = require('./src/services/stateMachineService');
  
  if (!StateMachineService.isValidTransition('Applied', 'Screening')) {
    throw new Error('isValidTransition returned false for valid transition');
  }
  if (StateMachineService.isValidTransition('Applied', 'Hired')) {
    throw new Error('isValidTransition returned true for invalid transition');
  }
  if (StateMachineService.getValidNextStages('Applied').length === 0) {
    throw new Error('getValidNextStages returned empty array');
  }
  const allStages = StateMachineService.getAllStages();
  if (allStages.length !== 6) {
    throw new Error(`getAllStages returned ${allStages.length} stages, expected 6`);
  }
});

// Test 10: Package.json has all required scripts
addTest('package.json has all required scripts', () => {
  const pkg = require('./package.json');
  if (!pkg.scripts.dev) throw new Error('dev script missing');
  if (!pkg.scripts.start) throw new Error('start script missing');
  if (!pkg.scripts.worker) throw new Error('worker script missing');
  if (!pkg.scripts.test) throw new Error('test script missing');
});

// Test 11: Package.json has all required dependencies
addTest('package.json has all required dependencies', () => {
  const pkg = require('./package.json');
  const required = [
    'express', 'dotenv', 'cors', 'helmet', 'express-validator',
    'jsonwebtoken', 'bcryptjs', 'pg', 'sequelize', 'redis',
    'bullmq', '@sendgrid/mail', 'express-rate-limit'
  ];
  
  for (const dep of required) {
    if (!pkg.dependencies[dep] && !pkg.devDependencies[dep]) {
      throw new Error(`Dependency ${dep} is missing`);
    }
  }
});

// Test 12: Database config can be imported
addTest('Database configuration can be imported', () => {
  const sequelize = require('./src/config/database');
  if (!sequelize) throw new Error('sequelize not exported');
});

// Test 13: Redis config can be imported
addTest('Redis configuration can be imported', () => {
  const redisClient = require('./src/config/redis');
  if (!redisClient) throw new Error('redisClient not exported');
});

// Test 14: Application files exist and can be imported
addTest('Application files exist', () => {
  const fs = require('fs');
  const files = [
    'src/app.js',
    'src/server.js',
    'package.json',
    '.env',
    '.gitignore'
  ];
  
  for (const file of files) {
    if (!fs.existsSync(file)) {
      throw new Error(`File ${file} does not exist`);
    }
  }
});

// Test 15: Test files exist
addTest('Test files exist', () => {
  const fs = require('fs');
  const testFiles = [
    'tests/unit/stateMachine.test.js',
    'tests/unit/rbac.test.js'
  ];
  
  for (const file of testFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Test file ${file} does not exist`);
    }
  }
});

// Run all tests
runTests();
