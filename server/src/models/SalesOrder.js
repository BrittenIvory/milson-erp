const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalesOrder = sequelize.define('SalesOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  required_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Confirmed', 'In Progress', 'Shipped', 'Delivered', 'Cancelled'),
    defaultValue: 'Draft',
  },
  shipping_address: {
    type: DataTypes.TEXT,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  total_amount: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
  xero_invoice_id: {
    type: DataTypes.STRING(255),
  },
  created_by: {
    type: DataTypes.INTEGER,
  },
  updated_by: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'sales_orders',
  timestamps: true,
  underscored: true,
});

module.exports = SalesOrder;
