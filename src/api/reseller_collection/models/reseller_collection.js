import { DataTypes } from "sequelize";
import sequelize from "../../../../database/index.js";

const ResellerCollection = sequelize.define("ResellerCollection", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
ResellerCollection.sync();
export default ResellerCollection;
