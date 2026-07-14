const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupplierPrice = sequelize.define('SupplierPrice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  part_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cost: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
  },
  effective_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: 'supplier_prices',
  timestamps: true,
  underscored: true,
});

module.exports = SupplierPrice;
