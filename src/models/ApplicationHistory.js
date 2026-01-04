const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApplicationHistory = sequelize.define('ApplicationHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  previousStage: {
    type: DataTypes.STRING,
  },
  newStage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  changedBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = ApplicationHistory;
