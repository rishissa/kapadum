import { DataTypes } from "sequelize";
import sequelize from '../../../../database/index.js';

const Collection_static = sequelize.define("Collection_static", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tag: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
Collection_static.sync();
export default Collection_static;