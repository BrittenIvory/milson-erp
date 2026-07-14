const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PartSupplier = sequelize.define('PartSupplier', {
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
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'suppliers', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  standard_cost: {
    type: DataTypes.DECIMAL(14, 4),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  currency: {
    type: DataTypes.CHAR(3),
    allowNull: false,
    defaultValue: 'USD',
  },
  lead_time_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  minimum_order_quantity: {
    type: DataTypes.DECIMAL(14, 3),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  preferred_supplier: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'part_suppliers',
  timestamps: true,
  underscored: true,
  indexes: [
    { name: 'part_suppliers_part_supplier_unique', unique: true, fields: ['part_id', 'supplier_id'] },
    { name: 'part_suppliers_supplier_idx', fields: ['supplier_id'] },
    {
      name: 'part_suppliers_one_preferred_per_part',
      unique: true,
      fields: ['part_id'],
      where: { preferred_supplier: true },
    },
  ],
});

module.exports = PartSupplier;
