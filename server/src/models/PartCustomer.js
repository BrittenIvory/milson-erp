const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PartCustomer = sequelize.define('PartCustomer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  part_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'parts', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'customers', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  customer_part_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  customer_description: {
    type: DataTypes.STRING(500),
  },
  annual_usage: {
    type: DataTypes.DECIMAL(14, 3),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
}, {
  tableName: 'part_customers',
  timestamps: true,
  underscored: true,
  indexes: [
    { name: 'part_customers_part_customer_unique', unique: true, fields: ['part_id', 'customer_id'] },
    { name: 'part_customers_customer_part_number_idx', fields: ['customer_id', 'customer_part_number'] },
  ],
});

module.exports = PartCustomer;
