
import { DataTypes } from 'sequelize';
import sequelize from '../../../../database/index.js';
const Banner = sequelize.define("Banner", {
  action: {
    type: DataTypes.ENUM(["LINK", "COLLECTION", "PRODUCT"]),
    allowNull: false
  },
  data: {
    type: DataTypes.STRING
  }
});

Banner.sync();
export default Banner;
