const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const UserType = sequelize.define('UserType', {
  user_type_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_type_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  create_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  update_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'users_type',
  timestamps: false
});

module.exports = UserType;
