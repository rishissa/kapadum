import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../../../../database/index.js";

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  country_code: {
    type: DataTypes.STRING,
    defaultValue: "+91",
  },
  wallet_balance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  password_reset_token: {
    type: DataTypes.STRING,
  },
  FCM_app_token: {
    type: DataTypes.STRING,
  },
  FCM_web_token: {
    type: DataTypes.STRING,
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  otp: {
    type: DataTypes.STRING,
  },
  otp_expiration: {
    type: DataTypes.DATE,
  },
});
User.sync();

export default User;
