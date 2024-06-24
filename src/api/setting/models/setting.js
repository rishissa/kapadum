import { DataTypes } from "sequelize";
import sequelize from "../../../../database/index.js";
import store_types from "../../../constants/store_types.js";

const Setting = sequelize.define("Setting", {
  store_mode: {
    type: DataTypes.ENUM(...store_types),
  },
  is_cart_enabled: {
    type: DataTypes.BOOLEAN,
  },
  is_wallet_enabled: {
    type: DataTypes.BOOLEAN,
  },
  is_pricing_enabled: {
    type: DataTypes.BOOLEAN,
  },
  is_app_enabled: {
    type: DataTypes.BOOLEAN,
  },
  is_store_active: {
    type: DataTypes.BOOLEAN,
  },
  is_maintenance_mode: {
    type: DataTypes.BOOLEAN,
  },
  store_inactive_message: {
    type: DataTypes.STRING,
  },
  store_maintenance_message: {
    type: DataTypes.STRING,
  },
  product_card_style: {
    type: DataTypes.ENUM("PORTRAIT", "SQUARE"),
  },
  category_card_style: {
    type: DataTypes.ENUM("LANDSCAPE", "SQUARE"),
  },
  product_list_span_mobile: {
    type: DataTypes.INTEGER,
  },
  product_list_span_desktop: {
    type: DataTypes.INTEGER,
  },
});

Setting.sync();

export default Setting;
