import { DataTypes } from "sequelize";
import sequelize from "../../../../database/index.js";

const ProductTag = sequelize.define("ProductTag", {});

ProductTag.sync();
export default ProductTag;
