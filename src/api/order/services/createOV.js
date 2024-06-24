import { randomBytes } from "crypto";
import { errorResponse } from "../../../services/errorResponse.js";
import Order from "../models/order.js";
import Order_variant from "../../order_variant/models/order_variant.js";

export async function createOrderVaraint({
  user,
  body,
  transaction,
  variantsPrice,
  totalAmount,
}) {
  try {
    const order = await Order.create({
      slug: generateOrderId(),
      consumer_name: body.consumer.name,
      consumer_email: body.consumer.email,
      consumer_phone: body.consumer.phone,
      // payment_order_id: razorpayOrder.id,
      price: totalAmount,
      UserId: user,
      // payment_mode: body.payment_mode,
      status: "new",
      AddressId: body.AddressId,
      is_paid: false,
      is_reseller_order: body.consumer.isResellerOrder,
    });

    let order_variants_body = [];

    for (const [i, it] of body.variants.entries()) {
      let obj = {};
      obj["quantity"] = it.quantity;
      obj["VariantId"] = it.VariantId;
      obj["price"] = variantsPrice[it.VariantId];
      obj["status"] = "NEW";
      obj["OrderId"] = order.id;
      obj["note"] = it.note;
      if (body.consumer.isResellerOrder) {
        obj["selling_price"] = it.sellingPrice;
      }
      order_variants_body.push(obj);
    }

    const orderVariant = await Order_variant.bulkCreate(order_variants_body);

    return order.id;
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    throw error;
  }
}

export async function getAccountId({ client }) {
  try {
    console.log(client);
    const sequelize = await dbConnection(null);

    const user = await User.findOne({ where: { subdomain: client } });

    if (!user) {
      return res.status(400).send(
        errorResponse({
          message: "Bad Request!",
          details: "clint is not present in the database",
        })
      );
    }

    const account_id = user.razorpay_account_id;

    return account_id;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSelectedGateway() {
  try {
    const sequelize = await dbConnection(null);

    const global = await Global.findOne();

    if (!global) {
      return res.status(400).send(
        errorResponse({
          message: "Bad Request!",
          details: "global is not present in the database",
        })
      );
    }

    const selected_payment_gateway = global.selected_payment_gateway;

    return selected_payment_gateway;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const generateOrderId = () => {
  const order_id_prefix = "ORD";
  const order_id_length = 10;
  const generatedOrderId =
    order_id_prefix +
    randomBytes(order_id_length / 2)
      .toString("hex")
      .toUpperCase();
  return generatedOrderId;
};
