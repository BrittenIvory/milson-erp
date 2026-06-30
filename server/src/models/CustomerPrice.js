const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomerPrice = sequelize.define('CustomerPrice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  part_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
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
  tableName: 'customer_prices',
  timestamps: true,
  underscored: true,
});

module.exports = CustomerPrice;
