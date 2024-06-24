import { DataTypes } from "sequelize";
import sequelize from '../../../../database/index.js';
import store_types from "../../../constants/store_types.js";

const Global = sequelize.define(
  "Global",
  {
    subscription_price: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    cod_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    cod_prepaid: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
      allowNull: true,
    },
    cod_prepaid_type: {
      type: DataTypes.ENUM("PRICE", "PERCENTAGE"),
      allowNull: true,
      defaultValue: "PRICE",
    },
    shipping_value: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    shipping_value_type: {
      type: DataTypes.ENUM("PRICE", "PERCENTAGE"),
      defaultValue: "PRICE",
    },
    razorpay_key: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpay_secret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    withdraw_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    razorpayX_account_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shiprocket_username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shiprocket_password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_shiprocket_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    shiprocket_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    selected_payment_gateway: {
      type: DataTypes.ENUM("RAZORPAY", "CASHFREE", "PHONEPE", "NONE"),
      defaultValue: "NONE",
    },
    selected_shipment: {
      type: DataTypes.ENUM("CUSTOM_COURIER", "SHIPROCKET", "BLUE_DART"),
      defaultValue: "CUSTOM_COURIER",
    },
    bulk_pricing: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    cashfree_client_secret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cashfree_client_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phonepe_merchant_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phonepe_merchant_key: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phonepe_key_index: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firebase_auth: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    firebase_topic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_verification_method: {
      type: DataTypes.ENUM("FIREBASE", "MSG91"),
      allowNull: true,
    },
    return_request: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    return_request_period: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    store_type: {
      type: DataTypes.ENUM(...store_types),
    },
    personal_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    theme_color: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["id"],
      },
    ],
  }
);

Global.sync();
export default Global;