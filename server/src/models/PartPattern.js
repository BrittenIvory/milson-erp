const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PartPattern = sequelize.define('PartPattern', {
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
  pattern_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  pattern_owner: {
    type: DataTypes.STRING(255),
  },
  pattern_location: {
    type: DataTypes.STRING(500),
  },
  pattern_status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'Active',
  },
  pattern_cost: {
    type: DataTypes.DECIMAL(14, 4),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
}, {
  tableName: 'part_patterns',
  timestamps: true,
  underscored: true,
  indexes: [
    { name: 'part_patterns_part_number_unique', unique: true, fields: ['part_id', 'pattern_number'] },
    { name: 'part_patterns_status_idx', fields: ['pattern_status'] },
    { name: 'part_patterns_owner_idx', fields: ['pattern_owner'] },
  ],
});

module.exports = PartPattern;
