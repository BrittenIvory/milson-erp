const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  part_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  transaction_type: {
    type: DataTypes.ENUM('Receipt', 'Shipment', 'Adjustment', 'Count', 'Return'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  reference_type: {
    type: DataTypes.STRING(50),
  },
  reference_id: {
    type: DataTypes.INTEGER,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  created_by: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'inventory_transactions',
  timestamps: true,
  underscored: true,
  updatedAt: false,
});

module.exports = InventoryTransaction;
