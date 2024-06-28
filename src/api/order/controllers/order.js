import { activity_event } from "../../../constants/activity_log.js";
import axios from "axios";
import { createActivityLog } from "../../../services/createActivityLog.js";
import {
  createTransaction,
  adminTransaction,
} from "../../../services/createTrnx.js";
import crypto from "crypto";
import { getPagination, getMeta } from "../../../services/pagination.js";
import getWebhookBody from "../services/getWebhookBody.js";
import generateOrderId from "../services/orderId.js";
import generateTransactionId from "../services/orderId.js";
import * as jwt from "../../../services/jwt.js";
import { order_status } from "../../../constants/order_status.js";
import orderTracker from "../../../services/orderTracker.js";
import {
  createOrderVaraint,
  getAccountId,
  getSelectedGateway,
} from "../services/createOV.js";
import { Op } from "sequelize";
import Razorpay from "razorpay";
import { errorResponse } from "../../../services/errorResponse.js";
import { verify as _verify } from "../../../services/jwt.js";
import * as uuid from "uuid";
import * as transaction from "../../../constants/transaction.js";
import mailSender from "../../../services/emailSender.js";
import fs, { truncate } from "fs";
import ejs from "ejs";
import tenantMetric from "../../../services/tenantMetric.js";
import { tenant_metric_fields } from "../../../constants/tenant_metric.js";
import productMetrics from "../../../services/productMetrics.js";
import { product_metric_field } from "../../../constants/productMetric.js";
import bulkPricingChecker from "../services/bulkPricingChecker.js";
import * as order from "../../../constants/order.js";

// import dbConnection from "../../../utils/dbConnection.js"
import { defaultRazorpay } from "../../../utils/gateway.js";
import codChecker from "../services/codChecker.js";
import shippingPriceChecker from "../services/shippingPriceChecker.js";
import orderBy from "../../../services/orderBy.js";
import excelExport from "../../../services/excelExport.js";
import Order from "../models/order.js";
import Order_variant from "./../../order_variant/models/order_variant.js";
import sequelize from "../../../../database/index.js";
import { uid } from "uid";
import User from "../../user/models/user.js";
import Payment_log from "../../payment_log/models/payment_log.js";
import Variant from "../../variant/models/variant.js";
import Wallet from "../../wallet/models/wallet.js";
import { createInvoice } from "../services/invoiceGenerator.js";
import Address from "../../address/models/address.js";
import Product from "../../product/models/product.js";
import Media from "../../upload/models/media.js";
const RZ_RCT = uid(10).toUpperCase();
export async function create(req, res) {
  try {
    const newOrder = await Order.create(req.body);
    return res.status(201).send({
      message: "Order created successfully!",
      data: newOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to create an order" });
  }
}

export async function update(req, res) {
  try {
    const orderId = req.params.id;

    const [updatedRowsCount, [updatedOrder]] = await Order.update(req.body, {
      where: { id: orderId },
      returning: true,
    });

    if (updatedRowsCount === 0) {
      return res.status(404).send({ error: "Order not found" });
    }

    return res.status(200).send({
      message: "Order updated successfully!",
      data: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to update the order" });
  }
}

export async function find(req, res) {
  try {
    const query = req.query;
    const pagination = await getPagination(query.pagination);
    const whereClause_OV = {};
    const whereClause_O = {};
    if (query.hasOwnProperty("status")) {
      if (query.status.toLowerCase() === "all") {
      } else if (!Object.values(order.order_status).includes(query.status)) {
        return res.status(400).send(
          errorResponse({
            message: `Invalid status type select from ${Object.values(
              order.order_status
            )}`,
          })
        );
      } else {
        whereClause_OV.status = query.status;
      }
    }
    if (query.hasOwnProperty("payment_mode")) {
      if (!Object.values(order.payment_modes).includes(query.payment_mode)) {
        return res.status(400).send(
          errorResponse({
            message: `Invalid Payment Mode Type select from ${Object.values(
              order.payment_modes
            )}`,
          })
        );
      }
      whereClause_O.payment_mode = query.payment_mode;
    }
    if (query.hasOwnProperty("reseller_order")) {
      query.reseller_order === "true"
        ? (whereClause_O.is_reseller_order = true)
        : query.reseller_order === "false"
        ? (whereClause_O.is_reseller_order = false)
        : "";
    }
    const orders = await Order.findAndCountAll({
      where: whereClause_O,
      include: [
        {
          model: Order_variant,
          as: "orderVariants",
          where: whereClause_OV,
          include: [
            {
              model: Variant,
              as: "variant",
              include: [
                {
                  model: Product,
                  as: "product",
                  include: [
                    { model: Media, as: "thumbnail", attributes: ["url"] },
                    { model: Media, as: "gallery", attributes: ["url"] },
                  ],
                },
              ],
            },
          ],
        },
      ],
      offset: pagination.offset,
      limit: pagination.limit,
    });

    const meta = await getMeta(pagination, orders.count);
    
    return res.status(200).send({
      data: orders.rows,
      meta,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server Error",
        details: error.message,
      })
    );
  }
}

export async function findOne(req, res) {
  try {
    const id = req.params.id;
    const order = await Order.findOne({
      where: { id: id },
      include: [
        {
          model: Order_variant,
          as: "orderVariants",
          include: [
            {
              model: Variant,
              as: "variant",
              include: ["thumbnail"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res
        .status(404)
        .send(errorResponse({ status: 404, message: "Order not found" }));
    }

    return res.status(200).send({ data: order });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to fetch the order" });
  }
}

export const _delete = async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedRowCount = await Order.destroy({ where: { id: orderId } });

    if (deletedRowCount === 0) {
      return res.status(404).send({ error: "Order not found" });
    }

    return res.status(200).send({ message: "Order deleted successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to delete the order" });
  }
};

export async function checkOut(req, res) {
  const client = req.hostname.split(".")[0];
  const user = req.user;
  const UserId = user.id;
  const variants_details = req.variants_arr;
  const plan = req.user_sub;
  try {
    await sequelize.transaction(async (t) => {
      console.log("Entered in razorpay checkout");
      const global = req.global;
      const body = req.body;
      const variants = body.variants;
      const user_recent_sub = req.user_sub;
      let { totalAmount, variantsPrice } = await bulkPricingChecker({
        user,
        variants,
        variants_details,
        user_recent_sub,
      });
      if (req.body.payment_mode === "COD") {
        const COD = await codChecker(global, totalAmount);
        totalAmount = +COD.codAmount;
      }

      const shippingPrice = await shippingPriceChecker({
        global,
        variantsArray: variants_details,
        variantsPrice,
      });
      totalAmount += shippingPrice;

      let razorpay, options, rzOrder, PG_used;

      if (
        global.selected_payment_gateway !== "NONE" &&
        global.razorpay_secret &&
        global.razorpay_key
      ) {
        PG_used = "STORE";
      } else {
        const selected_payment_gateway = await getSelectedGateway();
        PG_used = selected_payment_gateway === "SPAY" ? "SPAY" : "GLOBAL";
      }

      switch (PG_used) {
        case "STORE":
          console.log("PG STORE");
          // razorpay = new Razorpay({ key_id: global.razorpay_key, key_secret: global.razorpay_secret });
          razorpay = (await defaultRazorpay()).instance;
          options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: "RCT" + RZ_RCT,
          };
          rzOrder = await razorpay.orders.create(options);
          break;
        case "GLOBAL":
          console.log("PG GLOBAL");
          razorpay = (await defaultRazorpay()).instance;
          const account_id = await getAccountId({ client });
          if (!account_id) {
            return res.status(400).send(
              errorResponse({
                message: "Bad Request!",
                details: "razorpay routes cred missing",
              })
            );
          }

          options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: "RCT" + RZ_RCT,
            transfers: [
              {
                account: account_id,
                amount: totalAmount * 100,
                currency: "INR",
                notes: {
                  branch: "Acme Corp Bangalore North",
                  name: client,
                },
                linked_account_notes: ["branch"],
              },
            ],
          };

          rzOrder = await razorpay.orders.create(options);
          break;
        case "SPAY":
          console.log("PG SPAY");
          const order_body = {
            totalAmount: totalAmount,
            payment_mode: body.payment_mode,
            razorpay_env: process.env.ENVIRONMENT,
          };

          try {
            const personalId = await global.personal_id;
            const razorpayOrder = await axios.post(
              "https://5137-115-245-32-170.ngrok-free.app/api/orders/razorpay",
              order_body,
              {
                headers: {
                  "X-VERIFY": personalId,
                  "Content-Type": "application/json",
                },
              }
            );
            rzOrder = razorpayOrder.data;
          } catch (error) {
            console.error("Error sending Razorpay request:", error);
            return res
              .status(500)
              .send(errorResponse({ message: error.message, status: 500 }));
          }
          break;

        default:
          break;
      }

      const order_id = await createOrderVaraint({
        body,
        razorpayOrder: rzOrder,
        sequelize,
        transaction: t,
        UserId,
        variants_details,
        variantsPrice,
      });

      return res.status(200).send({ data: { ...rzOrder, order_id } });
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: error.message }));
  }
}

export async function verify(req, res) {
  const t = await sequelize.transaction();
  try {
    // const global = await Store_global.findOne({ raw: true });
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    const token = _verify(req);
    let razorpayInstance, razorpay_secret, amount;
    const user = await User.findByPk(token.id);

    // if (global.selected_payment_gateway !== "NONE" && global.razorpay_secret && global.razorpay_key) {
    // razorpayInstance = new Razorpay({ key_id: global.razorpay_key, key_secret: global.razorpay_secret });
    razorpayInstance = (await defaultRazorpay()).instance;
    razorpay_secret = (await defaultRazorpay()).credential.razorpay_secret;
    // } else {
    //   const selected_payment_gateway = await getSelectedGateway();

    //   if (selected_payment_gateway === "SPAY") {
    //     try {
    //       console.log("entered in spay");
    //       const verifyCallback = await axios.post(`https://5137-115-245-32-170.ngrok-free.app/api/orders/razorpay/verify`, {
    //         order_id: order_id,
    //         razorpay_env: process.env.ENVIRONMENT,
    //         razorpay_order_id,
    //         razorpay_payment_id,
    //         razorpay_signature,
    //       });

    //       amount = verifyCallback.data.amount / 100;
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   } else {
    //     razorpayInstance = (await defaultRazorpay()).instance;
    //     PG_used = "global";
    //     razorpay_secret = (await defaultRazorpay()).credential.razorpay_secret;
    //   }
    // }

    // ################################ Signature Check  #################################

    if (razorpay_secret !== null) {
      const generateSignature = crypto
        .createHmac("sha256", razorpay_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (generateSignature !== razorpay_signature) {
        return res.status(400).send(
          errorResponse({
            message: "Bad Request!",
            details:
              "razorpay_signature and generated_signature did not match!",
          })
        );
      }
      const rzOrder = await razorpayInstance.orders.fetch(razorpay_order_id);
      amount = rzOrder.amount / 100;

      let payment_log_data = {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        status: "CAPTURED",
        amount: amount,
      };

      const log = await Payment_log.findOne({
        where: { order_id: razorpay_order_id },
      });
      if (log && !log.method) {
        const update_log = await log.update(payment_log_data, {
          transaction: t,
        });
      } else {
        const create_log = await Payment_log.create(payment_log_data, {
          transaction: t,
        });
      }
    }

    // ################################ Signature Check End  #################################

    await createTransaction({
      purpose: transaction.purpose.PURCHASE,
      amount: amount,
      mode: transaction.mode.MONEY,
      UserId: user.id,
      transaction: t,
      txn_type: transaction.txn_type.CREDIT,
    });

    // await adminTransaction({
    //   subdomain: req.subdomain,
    //   purpose: transaction.purpose.PURCHASE,
    //   amount: amount,
    //   mode: transaction.mode.MONEY,
    //   txn_type: transaction.txn_type.CREDIT,
    // });

    const [rows, [order]] = await Order.update(
      {
        is_paid: true,
        payment_id: razorpay_payment_id,
      },
      {
        where: { payment_order_id: razorpay_order_id },
        returning: true,
        transaction: t,
      }
    );

    const [rowsCunt, orderVariant] = await Order_variant.update(
      {
        status: order_status.NEW,
        is_cod_paid:
          order.payment_mode === "COD" && order.is_paid === true ? true : false,
      },
      {
        where: { OrderId: order.id },
        transaction: t,
        returning: true,
        // raw: true,
      }
    );

    for (const ov of orderVariant) {
      await Variant.decrement(
        { quantity: ov.quantity },
        {
          where: { id: ov.VariantId },
          transaction: t,
        }
      );
    }

    const htmlContent = fs.readFileSync("./views/orderTemplate.ejs", "utf8");
    const renderedContent = ejs.render(htmlContent, {
      name: user?.name,
      price: 200,
      slug: "hsf",
      discount: 10,
    });

    await mailSender.mailSender({
      to: user?.email,
      subject: "Order Placed",
      html: renderedContent,
    });

    // // ################### Code to Create Order Tracker entry ############# //

    const orderVariantIds = orderVariant.map((variant) => {
      return variant.id;
    });

    const orderVariants = await Order_variant.findAll({
      where: { id: { [Op.in]: orderVariantIds } },
      include: [{ model: Variant, as: "variant" }],
    });

    const ProductIds = orderVariants.map((item) => {
      return item.variant.ProductId;
    });

    await createActivityLog({
      UserId: user.id,
      event: activity_event.ORDER_PLACED,
      transaction: t,
    });
    await orderTracker({
      order_variant_ids: orderVariantIds,
      status: order_status.NEW,
      transaction: t,
    });

    // await tenantMetric({
    //   subdomain: req.subdomain,
    //   field_name: [tenant_metric_fields.total_orders, tenant_metric_fields.total_transaction],
    // });

    await productMetrics({
      transaction: t,
      field_name: product_metric_field.revenue_generated,
      order_variant: orderVariants,
    });

    await productMetrics({
      field_name: product_metric_field.ordered_count,
      product_id: ProductIds,
      transaction: t,
    });
    await t.commit();
    return res.status(200).send({ success: true, data: orderVariants });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

export async function webhook(req, res) {
  try {
    console.log("entered in razorpay webhook");

    const storeGlobals = await Store_global.findOne();

    // // ################### if the razorpay credentials are present in store #################
    if (storeGlobals.razorpay_key && storeGlobals.razorpay_secret) {
      console.log("store razorpay key is present");
      const hookSignature = crypto.createHmac(
        "sha256",
        storeGlobals.razorpay_secret
      );

      hookSignature.update(JSON.stringify(req.body));
      const digest = hookSignature.digest("hex");

      if (digest !== req.headers["x-razorpay-signature"]) {
        return res.status(400).send({ error: "Invalid Request!" });
      }

      const global = await Store_global.findOne();
      const gateway = global.selected_payment_gateway;

      const webHookBody = await getWebhookBody(req, gateway);
      console.log(JSON.stringify(webHookBody));

      const payment_log = Payment_log.findOne({
        where: { order_id: req.body.payload.payment.entity.order_id },
      });

      if (payment_log) {
        return res.status(200).send({ data: payment_log });
      } else {
        const new_payment_log = Payment_log.create(webHookBody);
        return res.status(200).send({ data: new_payment_log });
      }

      // // ################### if the razorpay credentials are present in not store #################
    } else {
      console.log("store razorpay key is not present");
      const sequelize = await dbConnection(null);
      const global = await Global.findOne();

      const hookSignature = crypto.createHmac("sha256", global.razorpay_secret);

      hookSignature.update(JSON.stringify(req.body));
      const digest = hookSignature.digest("hex");

      if (digest !== req.headers["x-razorpay-signature"]) {
        return res.status(400).send({ error: "Invalid Request!" });
      }

      const gateway = global.selected_payment_gateway;

      const webHookBody = await getWebhookBody(req, gateway);
      console.log(JSON.stringify(webHookBody));

      const payment_log = Payment_log.findOne({
        where: { order_id: req.body.payload.payment.entity.order_id },
      });

      if (payment_log) {
        return res.status(200).send({ data: payment_log });
      } else {
        const new_payment_log = Payment_log.create(webHookBody);
        return res.status(200).send({ data: new_payment_log });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function checkOutWallet(req, res) {
  const variants_details = req.variants_arr;
  const client = req.hostname.split(".")[0];
  const token = jwt.verify(req);
  const { AddressId, variants } = req.body;
  const body = req.body;
  try {
    await sequelize.transaction(async (t) => {
      console.log("Entered in wallet checkout");
      const payment_id = generateTransactionId.generateTransactionId();
      const user = await User.findByPk(token.id);
      if (!user) {
        return res.status(400).send(
          errorResponse({
            message: "User Not Found",
          })
        );
      }

      const user_recent_sub = req.user_sub;
      let { totalAmount, variantsPrice } = await bulkPricingChecker({
        user,
        variants,
        variants_details,
        // body,
        user_recent_sub,
      });

      if (user.wallet_balance < totalAmount) {
        return res.status(400).send(
          errorResponse({
            message: "Insufficient wallet ballance",
          })
        );
      }

      const order = await Order.create(
        {
          slug: generateOrderId.generateTransactionId(),
          payment_order_id: generateTransactionId.generateOrderId(),
          payment_id,
          price: totalAmount,
          UserId: token.id,
          payment_mode: "WALLET",
          status: "NEW",
          AddressId: AddressId,
          is_paid: true,
          is_reseller_order: req.body.consumer.isResellerOrder,
          consumer_name: req.body.consumer.name,
          consumer_email: req.body.consumer.email,
          consumer_phone: req.body.consumer.phone,
        },
        { transaction: t } // Use the provided transaction if available
      );

      // console.log(order);
      let order_variants_body = [];

      for (const [i, it] of body.variants.entries()) {
        let obj = {};
        obj["quantity"] = it.quantity;
        obj["VariantId"] = it.VariantId;
        obj["price"] = variantsPrice[it.VariantId];
        obj["status"] = "NEW";
        obj["OrderId"] = order.id;
        if (body.consumer.isResellerOrder) {
          obj["selling_price"] = it.sellingPrice;
        }
        order_variants_body.push(obj);
      }

      const orderVariant = await Order_variant.bulkCreate(order_variants_body, {
        transaction: t,
      });

      // ################  Subtracting QTYs ####################
      let Vids = [];
      for (const variant of req.body.variants) {
        const [rowCount, [variantId]] = await Variant.update(
          { quantity: sequelize.literal(`quantity - ${variant.quantity}`) },
          {
            where: { id: variant.VariantId },
            returning: true,
            transaction: t,
          },
          { transaction: t }
        );
        Vids.push(variantId.ProductId);
      }

      const deductWalletBal = await User.increment(
        { wallet_balance: -totalAmount },
        {
          where: { id: user.id },
          transaction: t,
        }
      );

      const htmlContent = fs.readFileSync("./views/orderTemplate.ejs", "utf8");
      const renderedContent = ejs.render(htmlContent, {
        price: totalAmount,
        slug: "nuil",
        name: "narayan patel",
        discount: 99,
      });

      await createActivityLog({
        sequelize,
        UserId: token.id,
        event: activity_event.ORDER_PLACED,
        transaction: t,
      });
      await createTransaction({
        sequelize,
        purpose: transaction.purpose.PURCHASE,
        amount: totalAmount,
        mode: transaction.mode.WALLET,
        UserId: token.id,
        transaction: t,
        txn_type: transaction.txn_type.CREDIT,
      });
      await adminTransaction({
        subdomain: req.subdomain,
        purpose: transaction.purpose.PURCHASE,
        amount: totalAmount,
        mode: transaction.mode.WALLET,
        transaction: t,
        txn_type: transaction.txn_type.CREDIT,
      });

      await tenantMetric({
        subdomain: req.subdomain,
        field_name: tenant_metric_fields.total_orders,
      });

      let orderVariantIds = await orderVariant.map((variant) => {
        return variant.id;
      });

      await orderTracker({
        sequelize,
        order_variant_ids: orderVariantIds,
        status: order_status.ACCEPTED,
        transaction: t,
      });

      const orderVariants = await Order_variant.findAll({
        where: { id: { [Op.in]: orderVariantIds } },
        transaction: t,
        include: [{ model: Variant, as: "variant" }],
      });

      await productMetrics({
        sequelize,
        field_name: product_metric_field.revenue_generated,
        order_variant: orderVariants,
        transaction: t,
      });

      let product_ids = orderVariants.map((item) => {
        return item.variant.ProductId;
      });

      await productMetrics({
        sequelize,
        field_name: product_metric_field.ordered_count,
        product_id: product_ids,
        transaction: t,
      });

      await mailSender({
        to: "patelnarayan83499@gmail.com",
        subject: "Order Place VIA wallet",
        html: renderedContent,
      });
      return res.status(200).send({ data: order });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to create order" });
  }
}

export async function getOrdersByStatus(req, res) {
  try {
    const status = req.params.status;
    const query = req.query;
    const pagination = await getPagination(query.pagination);

    // Find orders with the specified status
    const orders = await Order.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      distinct: true,
      include: {
        model: Order_variant,
        as: "orderVariants",
        where: { status: status.toUpperCase() },
        required: false,
        attributes: [],
      },
    });
    const meta = await getMeta(pagination, orders.count);
    return res.status(200).send({
      data: orders.rows,
      meta,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error: "Failed to retrieve orders by status" });
  }
}

export async function searchOrders(req, res) {
  try {
    console.log("entering search");

    const query = req.query;
    const qs = query.qs.trim();
    const pagination = await getPagination(query.pagination);
    const whereClause_OV = {};
    const whereClause_O = {};

    if (query.hasOwnProperty("status")) {
      if (!Object.values(order.order_status).includes(query.status)) {
        return res.status(400).send(
          errorResponse({
            message: `Invalid status type select from ${Object.values(
              order.order_status
            )}`,
          })
        );
      }
      whereClause_OV.status = query.status;
    }
    if (query.hasOwnProperty("payment_mode")) {
      if (!Object.values(order.payment_modes).includes(query.payment_mode)) {
        return res.status(400).send(
          errorResponse({
            message: `Invalid Payment Mode Type select from ${Object.values(
              order.payment_modes
            )}`,
          })
        );
      }
      whereClause_O.payment_mode = query.payment_mode;
    }
    if (query.hasOwnProperty("reseller_order")) {
      query.reseller_order === "true"
        ? (whereClause_O.is_reseller_order = true)
        : query.reseller_order === "false"
        ? (whereClause_O.is_reseller_order = false)
        : "";
    }

    const orders = await Order.findAndCountAll({
      where: whereClause_O,
      include: [
        {
          model: Order_variant,
          as: "orderVariants",
          where: whereClause_OV,
          include: [
            {
              model: Variant,
              as: "variant",
              // where: { name: { [Op.iLike]: `%${qs}%` } },
            },
          ],
        },
      ],
      offset: pagination.offset,
      limit: pagination.limit,
    });

    const meta = await getMeta(pagination, orders.count);
    return res.status(200).send({ data: orders.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to fetch orders" });
  }
}

export async function createCashfreeOrder(req, res) {
  try {
    console.log("entered in cashfree order");
    const order_id = uuid.v4();

    const { payment, UserStoreId, VariantId, quantity } = req.body;

    const variant = await Variant.findByPk(VariantId);

    const amount = Number(variant.price * quantity);

    const options = {
      amount: Number(amount * 100),
      currency: "INR",
      receipt: "RCT" + RZ_RCT,
    };

    const createOrder = async () => {
      try {
        console.log("entered in create order");

        const order = await Order.create({
          order_id: order_id,
          price: amount,
          UserStoreId: UserStoreId,
          payment: payment,
          status: "new",
          address: "user address",
          isPaid: false,
        });

        console.log(order);
      } catch (error) {
        console.log(error);
        return error;
      }
    };

    const user = await User.findByPk(2);

    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        customer_details: {
          customer_id: "7112AAA812234",
          customer_phone: "9908734801",
          customer_email: user.email,
        },
        order_meta: {
          // return_url: `http://narayan.localhost:4500/api/order/cashfreeVerify?order_id=d1cdddbc-fcdb-4e84-a289-e5fe13b699d7`,
          return_url: `http://narayan.localhost:4500/api/order/cashfreeVerify?order_id=${order_id}`,
          // notify_url: "http://localhost:4500/api",
        },
        order_id: order_id,
        order_amount: amount,
        order_currency: "INR",
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        },
      }
    );

    const data = response.data;
    console.log(data);

    // Create a subscription
    await createOrder();

    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to create Cashfree order" });
  }
}

export async function verifyCashfree(req, res) {
  try {
    console.log("entered in verify cashfree");
    const order_id = req.query.order_id;
    const response = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      {
        headers: {
          accept: "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        },
      }
    );

    const result = response.data;
    if (result.order_status === "PAID") {
      try {
        const order = await Order.findOne({
          where: { payment_order_id: order_id },
        });

        if (order) {
          await order.update({
            payment_id: result.cf_order_id,
            status: "ACTIVE",
          });

          console.log("Subscription updated successfully");
        } else {
          console.log("Subscription not found");
        }
      } catch (error) {
        console.log("Error creating payment log:", error);
        return res.status(500).send("Internal Server Error");
      }

      return res
        .status(200)
        .send({ message: "Transaction Successful!", data: result });
    } else {
      return res.status(400).send(
        errorResponse({
          message: "Bad Request!",
          details:
            "cashfree_signature and generated signature did not matched!",
        })
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to verify Cashfree payment" });
  }
}

export async function webhookCashfree(req, res, buf) {
  try {
    console.log("entered in webhook cashfree");

    console.log(req.rawBody + "this is body");

    const ts = req.headers["x-webhook-timestamp"];
    const signature = req.headers["x-webhook-signature"];
    const currTs = Math.floor(new Date().getTime() / 1000);

    if (currTs - ts > 30000) {
      return res.status(400).send("Failed");
    }

    const genSignature = await verify(ts, req.rawBody);

    if (signature === genSignature) {
      console.log("signature is verified");
      const webHookBody = await getWebhookBody(req);
      console.log(webHookBody + "this is webhookBody");
      const payment_log = await Payment_log.create(webHookBody);
      console.log("Payment log created successfully with body" + webHookBody);

      return res.status(200).send("OK");
    } else {
      console.log("signature is not verified");
      return res.status(400).send("Failed");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
}

export async function resellerPayout(req, res) {
  const t = await sequelize.transaction();
  try {
    const token = jwt.verify(req);
    const { id } = req.params;

    const orderVariant = await Order_variant.findByPk(id, {
      include: ["order"],
    });

    console.log(orderVariant);

    if (
      !orderVariant ||
      orderVariant.status !== order_status.DELIVERED ||
      orderVariant.order.is_reseller_order !== true ||
      orderVariant.order.payment_mode !== order.payment_modes.cod
    ) {
      return res.status(400).send(
        errorResponse({
          message: "Order not eligible for payout",
          details: "Order is not in Delivered status",
        })
      );
    }

    await orderVariant.update(
      { status: order_status.PAYOUT_DONE },
      {
        where: { id: id },
        transaction: t,
        returning: true,
        include: ["order"],
      }
    );

    if (
      orderVariant.order.is_reseller_order &&
      orderVariant.order.payment_mode === "COD"
    ) {
      let payout_amount = orderVariant.selling_price - orderVariant.price;
      console.log(payout_amount);
      await User.update(
        {
          wallet_balance: sequelize.literal(
            `wallet_balance + ${payout_amount}`
          ),
        },
        { where: { id: orderVariant.order.UserId }, transaction: t }
      );
      await createTransaction({
        purpose: transaction.purpose.ADDED_TO_WALLET,
        amount: payout_amount,
        mode: transaction.mode.WALLET,
        UserId: orderVariant.order.UserId,
        transaction: t,
        txn_type: transaction.txn_type.DEBIT,
      });
      await Wallet.create(
        {
          UserId: orderVariant.order.UserId,
          amount: payout_amount,
          transaction_type: "DEPOSIT",
          remark: `Payout done for reseller order`,
        },
        { transaction: t }
      );
    }
    await createActivityLog({
      event: activity_event.ORDER_DELIVERED,
      UserId: token.id,
      transaction: t,
    });
    await orderTracker({
      sequelize,
      order_variant_ids: [id],
      status: order_status.DELIVERED,
      transaction: t,
    });
    await t.commit();

    return res
      .status(200)
      .send({ message: "payout has been initiated!", data: orderVariant });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res.status(500).send({ error: "Failed to update the order status" });
  }
}

export async function exportToExcel(req, res) {
  try {
    const query = req.query;
    const body = req.body;
    const whereClause = {};
    if (body.items.length && Array.isArray(body.items)) {
      whereClause.id = { [Op.in]: body.items };
    }
    const order = orderBy(query);
    const products = await Order.findAll({
      where: whereClause,
      order: order,
      include: [{ model: Order_variant, as: "orderVariants" }, "store_user"],
      raw: true,
    });

    const excelFile = await excelExport(products);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="output.xlsx"');
    return res.status(200).send(excelFile);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorResponse({ status: 500, message: error.message, details: error })
      );
  }
}

export async function generateInvoice(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        "user",
        {
          model: Address,
          as: "address",
          where: { [Op.and]: [{ addressLine1: { [Op.ne]: null } }] },
        },
        {
          model: Order_variant,
          as: "orderVariants",
          include: [{ model: Variant, as: "variant", include: "product" }],
        },
      ],
    });

    if (!order) {
      return res
        .status(404)
        .send(errorResponse({ status: 404, message: "order not found" }));
    }

    function getCurrentDate() {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
      const year = today.getFullYear();

      return `${day}/${month}/${year}`;
    }

    const invoiceData = {
      name: order?.user?.name,
      phone: order?.user?.phone,
      address: `${order?.address?.addressLine1},${order?.address?.city},${order?.address?.state},${order?.address?.pincode}`,
      invoice_number: order?.payment_order_id,
      invoice_date: JSON.parse(JSON.stringify(order.createdAt)).split("T")[0],
      products: order?.orderVariants?.map((item) => {
        return {
          name: item?.variant?.product?.name,
          quantity: item?.quantity,
          price:
            order?.is_reseller_order === true
              ? item?.selling_price
              : item?.price,
          total_price: order?.is_reseller_order
            ? item?.selling_price * item?.quantity
            : item?.price * item?.quantity,
        };
      }),
    };

    invoiceData.sub_total = invoiceData.products
      ?.map((item) => item.total_price)
      ?.reduce((sum, acc) => sum + acc);
    invoiceData.tax = 0.0;
    invoiceData.total = invoiceData.sub_total + invoiceData.tax;
    const invoice = await createInvoice(invoiceData, "order");

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": invoice.length,
      "Content-Disposition": 'attachment; filename="example.pdf"',
    });

    return res.status(200).send(invoice);
  } catch (error) {
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: error.message }));
  }
}
