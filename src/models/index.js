const User = require('./User');
const Company = require('./Company');
const Job = require('./Job');
const Application = require('./Application');
const ApplicationHistory = require('./ApplicationHistory');

// User associations
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Company.hasMany(User, { foreignKey: 'companyId', as: 'employees' });

// Job associations
Job.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Company.hasMany(Job, { foreignKey: 'companyId', as: 'jobs' });

Job.belongsTo(User, { foreignKey: 'createdBy', as: 'recruiter' });
User.hasMany(Job, { foreignKey: 'createdBy', as: 'jobsCreated' });

// Application associations
Application.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });
User.hasMany(Application, { foreignKey: 'candidateId', as: 'applications' });

Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });

// ApplicationHistory associations
ApplicationHistory.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });
Application.hasMany(ApplicationHistory, { foreignKey: 'applicationId', as: 'history' });

ApplicationHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });

module.exports = {
  User,
  Company,
  Job,
  Application,
  ApplicationHistory,
};
