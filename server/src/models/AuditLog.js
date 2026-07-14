const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  action: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  entity_id: {
    type: DataTypes.INTEGER,
  },
  old_values: {
    type: DataTypes.JSONB,
  },
  new_values: {
    type: DataTypes.JSONB,
  },
  ip_address: {
    type: DataTypes.STRING(45),
  },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true,
  updatedAt: false,
});

module.exports = AuditLog;
