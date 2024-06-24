import { DataTypes } from "sequelize";
import sequelize from "../../../../database/index.js";
const ResellerBanner = sequelize.define("ResellerBanner", {
  action: {
    type: DataTypes.ENUM(["LINK", "COLLECTION", "PRODUCT"]),
    allowNull: false,
  },
  data: {
    type: DataTypes.STRING,
  },
});

ResellerBanner.sync();
export default ResellerBanner;
