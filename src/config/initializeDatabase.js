const sequelize = require('./database');
const { User, Company, Job, Application, ApplicationHistory } = require('../models');

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated successfully');

    // Disable ALTER for SQLite; only use alter:true for Postgres in development
    const shouldAlter = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL.includes('sqlite');
    await sequelize.sync({ alter: shouldAlter, force: false });
    console.log('Database synchronized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    console.warn('Running in degraded mode: database unavailable. Set DATABASE_URL and start Postgres for full functionality.');
    return false;
  }
}

module.exports = initializeDatabase;
