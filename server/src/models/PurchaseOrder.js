const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  po_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  expected_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Sent', 'Confirmed', 'Partially Received', 'Received', 'Cancelled'),
    defaultValue: 'Draft',
  },
  shipping_method: {
    type: DataTypes.STRING(100),
  },
  notes: {
    type: DataTypes.TEXT,
  },
  total_amount: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
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
  tableName: 'purchase_orders',
  timestamps: true,
  underscored: true,
});

module.exports = PurchaseOrder;
