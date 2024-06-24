import { DataTypes } from "sequelize";

import sequelize from './../../../../database/index.js';

const Plan_metric = sequelize.define("Plan_metric", {
  subscribers_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  revenue_generated: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

Plan_metric.sync();
export default Plan_metric;