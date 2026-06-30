const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseReceiptLine = sequelize.define('PurchaseReceiptLine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  purchase_receipt_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  purchase_order_line_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  part_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity_received: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'purchase_receipt_lines',
  timestamps: true,
  underscored: true,
});

module.exports = PurchaseReceiptLine;
