// models/user_metrics.js
import { DataTypes } from "sequelize";
import sequelize from '../../../../database/index.js';

const Tenant_metric = sequelize.define("Tenant_metric", {
  total_spendings: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  total_products: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_users: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_leads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_transaction: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_disk_usage: {
    type: DataTypes.DECIMAL,
    defaultValue: 0,
  },
});

Tenant_metric.sync();
export default Tenant_metric;
