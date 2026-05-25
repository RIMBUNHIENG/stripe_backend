const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Subscription = sequelize.define('Subscription', {
  subscription_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subscription_Plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  end_date: {
    type: DataTypes.DATE
  },
  user_type_id: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'subscription',
  timestamps: false
});

module.exports = Subscription;
