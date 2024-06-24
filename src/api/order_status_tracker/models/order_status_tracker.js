import { DataTypes } from "sequelize";

import sequelize from '../../../../database/index.js';

const Order_status_tracker = sequelize.define("Order_status_tracker", {
  status: {
    type: DataTypes.ENUM(
      "NEW",
      "ACCEPTED",
      "DECLINED",
      "PROCESSING",
      "INTRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "COMPLETED",
      "PAYOUT_DONE",
      "RTO",
      "RETURN_REQUEST",
      "RETURN_ACCEPTED",
      "RETURN_DECLINED",
      "RETURN_RECEIVED",
      "RETURN_PENDING"
    ),
  },
});

Order_status_tracker.sync();
export default Order_status_tracker;