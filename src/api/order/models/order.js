import { Sequelize, DataTypes } from "sequelize";

import sequelize from "../../../../database/index.js";

const Order = sequelize.define("Order", {
  slug: {
    type: DataTypes.STRING,
  },
  payment_order_id: {
    type: DataTypes.STRING,
  },
  payment_id: {
    type: DataTypes.STRING,
  },
  payment_signature: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.DECIMAL,
  },
  payment_mode: {
    type: DataTypes.ENUM("COD", "PREPAID", "WALLET"),
  },
  is_paid: {
    type: DataTypes.BOOLEAN,
  },
  consumer_name: {
    type: DataTypes.STRING,
  },
  consumer_email: {
    type: DataTypes.STRING,
  },
  consumer_phone: {
    type: DataTypes.STRING,
  },
  is_reseller_order: {
    type: DataTypes.BOOLEAN,
  },
  buyer: {
    type: DataTypes.ENUM("RESELLER", "CONSUMER"),
  },
  // OrderVariantId: {
  //   type: Sequelize.INTEGER,
  //   references: {
  //     model:  Order_variant, // This is the model to which the column is pointing
  //     key: 'id'     // This is the column in the Order model that is being referenced
  //   }
  // }
});

Order.sync();
export default Order;
