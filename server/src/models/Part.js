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
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  revision: {
    type: DataTypes.STRING(20),
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'Active',
  },
  material: {
    type: DataTypes.STRING(100),
  },
  weight: {
    type: DataTypes.DECIMAL(10, 3),
    validate: { min: 0 },
  },
  finished_weight: {
    type: DataTypes.DECIMAL(10, 3),
    validate: { min: 0 },
  },
  weight_unit: {
    type: DataTypes.STRING(10),
    defaultValue: 'kg',
  },
  casting_process: {
    type: DataTypes.STRING(100),
  },
  hts_code: {
    type: DataTypes.STRING(20),
  },
  country_of_origin: {
    type: DataTypes.STRING(100),
  },
  safety_stock: {
    type: DataTypes.DECIMAL(14, 3),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  reorder_point: {
    type: DataTypes.DECIMAL(14, 3),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  lead_time_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  cost: {
    type: DataTypes.DECIMAL(14, 4),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  selling_price: {
    type: DataTypes.DECIMAL(14, 4),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
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
  indexes: [
    { name: 'parts_part_number_unique', unique: true, fields: ['part_number'] },
    { name: 'parts_status_idx', fields: ['status'] },
    { name: 'parts_hts_code_idx', fields: ['hts_code'] },
    { name: 'parts_country_of_origin_idx', fields: ['country_of_origin'] },
  ],
});

module.exports = Part;
