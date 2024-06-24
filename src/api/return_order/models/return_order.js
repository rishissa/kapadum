
import { DataTypes } from 'sequelize';
import sequelize from '../../../../database/index.js';

const Return_order = sequelize.define("Return_order", {
  note: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM("ACCEPTED", "REJECTED", "APPROVED", "PENDING"),
    defaultValue: "PENDING"
  },
});

Return_order.sync();
export default Return_order;
