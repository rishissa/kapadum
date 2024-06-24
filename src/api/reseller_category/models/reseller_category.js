import { DataTypes } from "sequelize";
import sequelize from "../../../../database/index.js";

// Define the Post model using the provided Sequelize instance
const ResellerCategory = sequelize.define("ResellerCategory", {
  name: {
    type: DataTypes.STRING,
  },
});

ResellerCategory.sync();
export default ResellerCategory;
