const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PartDocument = sequelize.define('PartDocument', {
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
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  upload_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  },
}, {
  tableName: 'part_documents',
  timestamps: true,
  underscored: true,
  indexes: [
    { name: 'part_documents_part_path_unique', unique: true, fields: ['part_id', 'file_path'] },
    { name: 'part_documents_file_type_idx', fields: ['file_type'] },
  ],
});

module.exports = PartDocument;
