const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  part_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  quantity_on_hand: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  quantity_allocated: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  quantity_on_order: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  reorder_point: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  reorder_quantity: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  location: {
    type: DataTypes.STRING(50),
  },
  last_count_date: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: 'inventory',
  timestamps: true,
  underscored: true,
});

module.exports = Inventory;
