const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const CommunityType = sequelize.define('CommunityType', {
  community_type_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  community_type_name: {
    type: DataTypes.STRING(100),
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
  tableName: 'community_type',
  timestamps: false
});

module.exports = CommunityType;
