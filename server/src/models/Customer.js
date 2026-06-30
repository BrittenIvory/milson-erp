const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  contact_person: {
    type: DataTypes.STRING(100),
  },
  email: {
    type: DataTypes.STRING(255),
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING(30),
  },
  address_line1: {
    type: DataTypes.STRING(255),
  },
  address_line2: {
    type: DataTypes.STRING(255),
  },
  city: {
    type: DataTypes.STRING(100),
  },
  state: {
    type: DataTypes.STRING(100),
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'USA',
  },
  postal_code: {
    type: DataTypes.STRING(20),
  },
  payment_terms: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  credit_limit: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  xero_contact_id: {
    type: DataTypes.STRING(255),
  },
  created_by: {
    type: DataTypes.INTEGER,
  },
  updated_by: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'customers',
  timestamps: true,
  underscored: true,
});

module.exports = Customer;
