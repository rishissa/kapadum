import { DataTypes } from "sequelize";
import sequelize from '../../../../database/index.js';

const Bulk_pricing = sequelize.define("Bulk_pricing", {
  from: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  to: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  premiumPrice: {
    type: DataTypes.DECIMAL,
  },
});

Bulk_pricing.sync();
export default Bulk_pricing;
