const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const AccountHistoryLog = sequelize.define('AccountHistoryLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  device_type: {
    type: DataTypes.STRING
  },
  action: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING
  },
  user_ip_address: {
    type: DataTypes.STRING(200)
  }
}, {
  tableName: 'account_history_log',
  timestamps: false
});

module.exports = AccountHistoryLog;
