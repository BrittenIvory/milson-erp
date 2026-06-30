const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrderLine = sequelize.define('PurchaseOrderLine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  part_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  line_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  unit_cost: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
  },
  line_total: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
  },
  quantity_received: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'purchase_order_lines',
  timestamps: true,
  underscored: true,
});

module.exports = PurchaseOrderLine;
