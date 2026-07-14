const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalesOrderLine = sequelize.define('SalesOrderLine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sales_order_id: {
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
  unit_price: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
  },
  line_total: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'sales_order_lines',
  timestamps: true,
  underscored: true,
});

module.exports = SalesOrderLine;
