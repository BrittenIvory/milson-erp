const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Part = sequelize.define('Part', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  part_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  material: {
    type: DataTypes.STRING(100),
  },
  weight: {
    type: DataTypes.DECIMAL(10, 3),
  },
  weight_unit: {
    type: DataTypes.STRING(10),
    defaultValue: 'kg',
  },
  hs_code: {
    type: DataTypes.STRING(20),
  },
  drawing_number: {
    type: DataTypes.STRING(50),
  },
  unit_of_measure: {
    type: DataTypes.STRING(20),
    defaultValue: 'EA',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
  },
  updated_by: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'parts',
  timestamps: true,
  underscored: true,
});

module.exports = Part;
