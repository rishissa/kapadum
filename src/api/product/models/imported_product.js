import { DataTypes } from "sequelize";
import sequelize from "../../../../database/index.js";
import User from "../../user/models/user.js";
import Variant from "../../variant/models/variant.js";

const ImportedProduct = sequelize.define("ImportedProduct", {
  reselling_price: DataTypes.FLOAT,
  UserId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
  VariantId: {
    type: DataTypes.INTEGER,
    references: {
      model: Variant,
      key: "id",
    },
  },
});

ImportedProduct.sync();
export default ImportedProduct;
