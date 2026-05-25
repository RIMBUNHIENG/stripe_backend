const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Skill = sequelize.define('Skill', {
  skill_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  skill_name: {
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
  tableName: 'skill',
  timestamps: false
});

module.exports = Skill;
