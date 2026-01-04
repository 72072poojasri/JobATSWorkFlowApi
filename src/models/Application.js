const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  stage: {
    type: DataTypes.ENUM('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'),
    defaultValue: 'Applied',
  },
  resume: {
    type: DataTypes.STRING,
  },
  coverLetter: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['candidateId', 'jobId'], unique: true },
  ],
});

module.exports = Application;
