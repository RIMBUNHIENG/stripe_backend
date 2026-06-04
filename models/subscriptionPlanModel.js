import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  subscription_Plan_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true  // Allow null for testing without admin
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  duration_day: {
    type: DataTypes.DATE // Represented as datetime in DBML. Note: If this is day duration (integer), it can be adjusted accordingly.
  },
  description: {
    type: DataTypes.STRING(255)
  },
  stripe_price_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  stripe_product_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'subscription_Plan',
  timestamps: false
});

export default SubscriptionPlan;
