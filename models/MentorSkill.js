const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const MentorSkill = sequelize.define('MentorSkill', {
  ms_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sub_skill_id: {
    type: DataTypes.INTEGER,
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
  tableName: 'mentor_skill',
  timestamps: false
});

module.exports = MentorSkill;
