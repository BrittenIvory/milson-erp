const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseReceipt = sequelize.define('PurchaseReceipt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  receipt_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  container_id: {
    type: DataTypes.INTEGER,
  },
  receipt_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  received_by: {
    type: DataTypes.INTEGER,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  xero_bill_id: {
    type: DataTypes.STRING(255),
  },
  created_by: {
    type: DataTypes.INTEGER,
  },
  updated_by: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'purchase_receipts',
  timestamps: true,
  underscored: true,
});

module.exports = PurchaseReceipt;
