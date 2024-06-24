import { DataTypes } from "sequelize";
import sequelize from '../../../../database/index.js';

const Variant = sequelize.define("Variant", {
  name: {
    type: DataTypes.STRING,
    require: true,
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    require: true,
  },
  premium_price: {
    type: DataTypes.DECIMAL,
    require: true,
  },
  strike_price: {
    type: DataTypes.DECIMAL,
    require: true,
  },
  // from: {
  //   type: DataTypes.DECIMAL,
  //   allowNull: true,
  // },
  // to: {
  //   type: DataTypes.DECIMAL,
  //   allowNull: true,
  // },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    require: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

Variant.sync();
export default Variant;