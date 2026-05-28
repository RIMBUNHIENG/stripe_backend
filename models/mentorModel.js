import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const Mentor = sequelize.define('Mentor', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false
  },
  firstname: {
    type: DataTypes.STRING(100)
  },
  lastname: {
    type: DataTypes.STRING(100)
  },
  gender: {
    type: DataTypes.STRING(20)
  },
  phone_number: {
    type: DataTypes.STRING(100)
  },
  address: {
    type: DataTypes.STRING(255)
  },
  experience_years: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  profile_picture: {
    type: DataTypes.TEXT
  },
  create_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  update_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'mentor',
  timestamps: false
});

export default Mentor;
