// models/Default_page.js
import { DataTypes } from "sequelize";
import sequelize from "../../../../database/index.js";

const Policy = sequelize.define("Policy", {
  about_us: {
    type: DataTypes.TEXT,
  },
  terms_and_conditions: {
    type: DataTypes.TEXT,
  },
  privacy_policy: {
    type: DataTypes.TEXT,
  },
  refund_and_cancellation: {
    type: DataTypes.TEXT,
  },
  ship_and_delivery: {
    type: DataTypes.TEXT,
  },
  contact_us: {
    type: DataTypes.TEXT,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ["id"],
    },
  ],
});

Policy.sync();
export default Policy