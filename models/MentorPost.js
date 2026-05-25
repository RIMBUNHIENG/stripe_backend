const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const MentorPost = sequelize.define('MentorPost', {
  post_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  province_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sub_skill_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.STRING(20)
  },
  create_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  update_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'mentor_post',
  timestamps: false
});

module.exports = MentorPost;
