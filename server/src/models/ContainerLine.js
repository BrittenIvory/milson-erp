const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContainerLine = sequelize.define('ContainerLine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  container_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  purchase_order_line_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
}, {
  tableName: 'container_lines',
  timestamps: true,
  underscored: true,
});

module.exports = ContainerLine;
