// models/Free_plan.js
import { DataTypes } from "sequelize";
import sequelize from '../../../../database/index.js';

const Free_plan = sequelize.define("Free_plan", {
  name: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  maxUsers: {
    type: DataTypes.INTEGER,
  },
  maxProducts: {
    type: DataTypes.INTEGER,
  },
  premiumPricing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  codAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  prepaidAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
},
  {
    indexes: [
      {
        unique: true,
        fields: ["id"],
      },
    ],
  }
);
Free_plan.sync();
export default Free_plan;
