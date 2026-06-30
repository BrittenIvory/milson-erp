const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Container = sequelize.define('Container', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  container_number: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(255),
  },
  expected_arrival_date: {
    type: DataTypes.DATEONLY,
  },
  actual_arrival_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Transit', 'At Port', 'Customs', 'Arrived', 'Received'),
    defaultValue: 'Pending',
  },
  vessel_name: {
    type: DataTypes.STRING(100),
  },
  bill_of_lading: {
    type: DataTypes.STRING(50),
  },
  notes: {
    type: DataTypes.TEXT,
  },
  created_by: {
    type: DataTypes.INTEGER,
  },
  updated_by: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'containers',
  timestamps: true,
  underscored: true,
});

module.exports = Container;
