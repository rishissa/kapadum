import { DataTypes } from "sequelize";
import sequelize from "../../../../database/index.js";

const ResellerInfo = sequelize.define("ResellerInfo", {
  total_products: {
    type: DataTypes.STRING,
  },
  total_orders: {
    type: DataTypes.STRING,
  },
});

ResellerInfo.sync();
export default ResellerInfo;
