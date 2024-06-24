// Controller function to create a new post

import { verify as _verify } from "../../../services/jwt.js";
import { createHmac } from "crypto";
import { getPagination, getMeta } from "../../../services/pagination.js";

// firebase credentials

import getWebhookBody from "../services/getWebhookBody.js";
import payment_log from "../../payment_log/models/payment_log.js";
import orderBy from "../../../services/orderBy.js";
import { defaultRazorpay, getRazorpay } from "../../../utils/gateway.js";
import { default as axios } from "axios";
import { errorResponse, tokenError } from "../../../services/errorResponse.js";
import { getDate, getValidToDates, updatetValidToDates } from "../../../services/date.js";
import { adminTransaction, createTransaction } from "../../../services/createTrnx.js";
import { purpose as _purpose, mode as _mode, txn_type as _txn_type } from "../../../constants/transaction.js";
import { createActivityLog } from "../../../services/createActivityLog.js";
import { activity_event } from "../../../constants/activity_log.js";
import dbCache from "../../../utils/dbCache.js";
import Server_subscription from "../../server_subscription/models/server_subscription.js";
import Payment_log from "../../payment_log/models/payment_log.js";
import Global from "../../global/models/global.js";
import User from "../../user/models/user.js";
import Plan from "../../plan/models/plan.js";
import { uid } from "uid";
import Subscription from "../models/subscription.js";
import sequelize from "../../../../database/index.js";
import { createInvoice } from "../../order/services/invoiceGenerator.js";
const RCT = uid(10).toUpperCase();

export async function create(req, res) {
  try {
    console.log("inside creat subs");
    const body = req.body;
    const valid_from = getDate();
    const valid_to = getValidToDates(10);
    const subscription = await Subscription.create({
      order_id: `OID_${uid(10)}`,
      payment_id: `PID_${uid(10)}`,
      order_type: body.order_type,
      valid_from: valid_from,
      valid_to: valid_to,
      PlanId: body.PlanId,
      purchaseType: "CASH",
      UserId: body.UserId
    });
    return res.status(200).send({ data: subscription });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to create a subscription" });
  }
}

export async function find(req, res) {
  try {
    const sequelize = req.db;
    const query = req.query;
    const order = orderBy(query);
    const pagination = await getPagination(query.pagination);
    const whereClause = {};

    if (query.hasOwnProperty("purchaseType") && ["ONLINE", "CASH"].includes(query.purchaseType)) {
      whereClause.purchaseType = query.purchaseType;
    }
    if (query.hasOwnProperty("is_paid")) {
      query.is_paid === "true" ? (whereClause.is_paid = true) : query.is_paid === "false" ? (whereClause.is_paid = false) : "";
    }

    const subscriptions = await Subscription.findAndCountAll({
      where: whereClause,
      limit: pagination.limit,
      offset: pagination.offset,
      order: order,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
        { model: Plan, as: "plan" }
      ]
    });

    const meta = await getMeta(pagination, subscriptions?.count);

    return res.status(200).send({ data: subscriptions?.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to fetch subscriptions" });
  }
}

export async function findOne(req, res) {
  try {
    const sequelize = req.db;
    const { id } = req.params;
    const subscription = await Subscription.findByPk(id, { include: { model: Plan, as: "plan" } });
    if (!subscription) return res.status(400).send(errorResponse({ message: "Invalid Subscription ID" }));
    return res.status(200).send(subscription);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to fetch subscription" });
  }
}

export async function usersSubsctions(req, res) {
  try {
    const sequelize = req.db;
    const token = _verify(req)
    if (token.error) {
      return res.status(401).send(tokenError(token))
    }
    const subscriptions = await Subscription.findAll({ where: { UserId: token.id }, include: { model: Plan, as: "plan" } });
    if (!subscriptions) return res.status(400).send(errorResponse({ message: "Invalid Subscription ID" }));
    return res.status(200).send({ data: subscriptions });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to fetch subscription" });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const getsubscription = await Subscription.findByPk(id);

    if (!getsubscription) return res.status(400).send(errorResponse({ message: "Invalid Subscription ID" }));
    const subscription = await Subscription.update(req.body, {
      where: { id },
      returning: true,
    });
    return res.status(200).send({ message: "subscription updated successfully!", data: subscription[1][0] });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to fetch subscription" });
  }
}

export const _delete = async (req, res) => {
  try {
    const sequelize = req.db;
    const { id } = req.params;
    const getsubscription = await Subscription.findByPk(id);

    if (!getsubscription) return res.status(400).send(errorResponse({ message: "Invalid ID to delete" }));
    const subscription = await Subscription.destroy({ where: { id } });
    return res.status(200).send({ message: "subscription deleted successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to fetch subscription" });
  }
};

export async function checkOut(req, res) {
  try {
    console.log("entered in checkout");
    const body = req.body;
    const plan = await Plan.findByPk(body.plan_id);
    const global = await Global.findOne({ raw: true });

    const GATEWAY = global.selected_payment_gateway;
    const amount = Number(plan.price);
    const options = {
      amount: Number(amount * 100),
      currency: "INR",
      receipt: "RCT" + RCT,
    };

    const token = _verify(req);
    const createSubscription = async (order) => {
      console.log("entered create subscription")
      try {
        const valid_from = getDate();
        const valid_to = getValidToDates(plan.validity);
        if (req.existing_sub) {
          const subscription = await Subscription.create({
            order_id: order.id || order,
            order_type: body.order_type,
            valid_from: req.valid_from,
            valid_to: updatetValidToDates(plan.validity, req.valid_from),
            PlanId: body.plan_id,
            purchaseType: "ONLINE",
            UserId: token.id,
          });
        } else {
          const subscription = await Subscription.create({
            order_id: order.id || order,
            order_type: body.order_type,
            valid_from: valid_from,
            valid_to: valid_to,
            PlanId: body.plan_id,
            purchaseType: "ONLINE",
            UserId: token.id,
          });
        }
      } catch (error) {
        console.log(error);
        return error;
      }
    };

    // const razorpay = await getRazorpay({ razorpay_key: global.razorpay_key, razorpay_secret: global.razorpay_secret });
    const razorpay = (await defaultRazorpay()).instance

    switch (GATEWAY) {
      case "NONE":
        // main db payment gateway
        const subscription = razorpay.orders.create(options, async function (error, order) {
          // console.log(order);
          if (error) {
            return res.status(error.statusCode).send(
              errorResponse({
                status: error.statusCode,
                message: error.error.reason,
                details: error.error.description,
              })
            );
          }
          await createSubscription(order);
          return res.status(200).send({ data: order });
        });
        break;
      case "RAZORPAY":
        const prePaidSubscription = razorpay.orders.create(options, async function (error, order) {
          console.log(order);
          if (error) {
            return res.status(error.statusCode).send(
              errorResponse({
                status: error.statusCode,
                message: error.error.reason,
                details: error.error.description,
              })
            );
          }
          await createSubscription(order);
          return res.status(200).send({ data: order });
        });
        break;

      case "CASHFREE":
        const user = await User.findByPk(token.id);
        const uuid = uid(10);
        const order_id = `CFPG_${uuid}`;
        const response = await axios.post(
          "https://sandbox.cashfree.com/pg/orders",
          {
            customer_details: {
              customer_id: "7112AAA812234",
              customer_phone: "9908734801",
              customer_email: user.email,
            },
            order_meta: {
              return_url: `http://localhost:4500/api/subscriptions/cf-verify?order_id=${order_id}`,
              notify_url: "http://localhost:4500/api",
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
        // Create a subscription
        await createSubscription(order_id);
        return res.status(200).send({ data: data });

        break;
      case "PHONEPE":
        break;

      default:
        break;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to fetch subscription" });
  }
}

export async function verify(req, res) {
  const t = await sequelize.transaction();
  try {
    const token = _verify(req);
    const body = req.body;
    const global = await Global.findOne({ raw: true });
    const { razorpay_signature, razorpay_payment_id, razorpay_order_id } = body;
    const razorpay_OP_id = razorpay_order_id + "|" + razorpay_payment_id;
    const razorpay = (await defaultRazorpay()).instance;

    const generateSignature = createHmac("sha256", global.razorpay_secret).update(razorpay_OP_id.toString()).digest("hex");
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id)
    console.log(razorpayOrder)
    if (generateSignature !== razorpay_signature) {
      return res.status(400).send(
        errorResponse({
          message: "Bad Request!",
          details: "razorpay_signature and generated signature did not matched!",
        })
      );
    }
    const subscription = await Subscription.update(
      {
        is_paid: true,
        payment_id: razorpay_payment_id,
        status: "ACTIVE",
      },
      { where: { order_id: razorpay_order_id } },
      { transaction: t }
    );

    // const token =
    //   "dDQ53sEPIHr6Wu5TUvxX5M:APA91bHlYmCT6Veoukmk_AozLrtYRegqhtPZIVHYtz8OeclbTp9jTTCrjuR20orkmAOa9P1yGom4hvfpPgOoDWOsHMr-XHhaftEYUKHfvdzI6oWxwhJrwM_4TuhJAQdD31YPewmC8kiP";
    // const message = {
    //   notification: {
    //     title: "Subscription Purchased successfullY!",
    //     body: "Your subscription has been created successfully , now you can enjoy premium benifits",
    //   },
    //   token,
    // };
    // const sendMessage = await firebaseAdmin.messaging().send(message)
    // console.log(sendMessage)
    await createTransaction({
      purpose: _purpose.PURCHASE,
      amount: razorpayOrder.amount / 100,
      mode: _mode.MONEY,
      UserId: token.id,
      transaction: t,
      txn_type: _txn_type.CREDIT,
    },
      { transaction: t }
    );
    await createActivityLog({
      event: activity_event.SUBSCRIPTION_ADDED,
      UserId: token.id,
      transaction: t,
    });
    await t.commit();
    return res.status(200).send({ message: "Transaction Successful!", data: subscription });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res.status(500).send(errorResponse({ message: error.message }))
  }
}

export async function CFVerify(req, res) {
  try {
    const token = verify(req);
    const body = req.body;
    const orderId = req.query.order_id;
    const response = await axios.get(`https://sandbox.cashfree.com/pg/orders/${orderId}`, {
      headers: {
        accept: "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
      },
    });

    const cashfree = response.data;
    console.log(cashfree);
    if (cashfree.order_status === "PAID") {
      const subscription = await Subscription.update(
        {
          is_paid: true,
          payment_id: cashfree.payment_session_id,
          status: "ACTIVE",
        },
        {
          where: { order_id: cashfree.order_id },
        }
      );
      return res.status(200).send(errorResponse({ message: "subscription purchased successfully!" }));
    } else {
      return res.status(200).send(errorResponse({ message: "Invalid Request!" }));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function refund(req, res) {
  try {
    const subscription = req.body.subscription;
    if (subscription.status === "REFUNDED") {
      return res.status(400).send(errorResponse({ status: 400, message: "subscription has been already refunded" }))
    }
    const refund = await razorpay.payments.refund(subscription.payment_id, { amount: subscription.plan.price * 100, speed: "normal" });
    if (refund) {
      const updateSubsciption = await Subscription.update(
        { status: "REFUNDED" },
        { where: { id: subscription.id } }
      );
    }
    return res.status(200).send({ message: "Refund Created", data: refund, subscription });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function webhook(req, res) {
  try {

    const hookSignature = createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRETE);
    hookSignature.update(JSON.stringify(req.body));
    const digest = hookSignature.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      return res.status(400).send({ error: "Invalid Request!" });
    }
    const webHookBody = await getWebhookBody(req);
    const payment_log = Payment_log.create(webHookBody);
    return res.status(200).send("ok");
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function CFWebhook(req, res) {
  try {
    const sequelize = req.db;
    const ts = req.headers["x-webhook-timestamp"];
    const signature = req.headers["x-webhook-signature"];
    const currTs = Math.floor(new Date().getTime() / 1000);

    if (currTs - ts > 30000) {
      return res.status(400).send(errorResponse({ message: "Invalid Request!" }));
    }

    const tsBody = ts + rawBody;
    const secretKey = process.env.CASHFREE_CLIENT_SECRET;
    let genSignature = createHmac("sha256", secretKey).update(tsBody).digest("base64");

    if (signature === genSignature) {
      console.log("signature is verified");
      const webHookBody = await getWebhookBody(req);
      const payment_log = await Payment_log.create(webHookBody);
      return res.status(200).send("OK");
    } else {
      return res.status(400).send(errorResponse({ message: "Invalid Request!" }));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
}

export async function SF_checkOut(req, res) {
  try {

    const global = await Global.findOne();
    const GATEWAY = global.selected_payment_gateway;
    const token = _verify(req)
    const user = await User.findOne({ where: { id: token.id } });
    const spayGlobal = await axios.get("https://api.spay.hangs.in/api/global")
    const serverPay = await axios.post("https://api.spay.hangs.in/api/client-subscription/razorpay", {}, { headers: { "x-verify": "RANISHA1234ASD" } })
    let razorpay_key = process.env.ENVIRONMENT === "DEV" ? spayGlobal.data.data.attributes.razorpay_test_key : spayGlobal.data.data.attributes.razorpay_key
    const valid_from = getDate();
    const valid_to = getValidToDates(30);
    console.log(razorpay_key)
    const subscription = await Server_subscription.create({
      order_id: serverPay.data.id,
      valid_from: valid_from,
      valid_to: valid_to,
      purchaseType: "ONLINE",
    });


    return res.status(200).send({ data: { ...serverPay.data, razorpay_key } })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to fetch subscription" });
  }
}

export async function SF_verify(req, res) {
  try {

    const token = _verify(req);
    const body = req.body;
    const { razorpay_signature, razorpay_payment_id, razorpay_order_id } = body;
    const razorpay_OP_id = razorpay_order_id + "|" + razorpay_payment_id;
    const spayGlobal = await axios.get("https://api.spay.hangs.in/api/global")
    let razorpay_secret = process.env.ENVIRONMENT === "DEV" ? spayGlobal.data.data.attributes.razorpay_test_secret : spayGlobal.data.data.attributes.razorpay_secret
    const generateSignature = createHmac("sha256", razorpay_secret).update(razorpay_OP_id.toString()).digest("hex");
    if (generateSignature !== razorpay_signature) {
      console.log("sign mismatch");
      return res.status(400).send(errorResponse({
        message: "Bad Request!",
        details: "razorpay_signature and generated signature did not matched!",
      }));
    }

    try {
      const verifyCallback = await axios.post(`https://api.spay.hangs.in/api/orders/razorpay/verify`, {
        razorpay_env: process.env.ENVIRONMENT,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      const [rows_count, [subscription]] = await Server_subscription.update(
        {
          is_paid: true,
          payment_id: razorpay_payment_id,
          status: "ACTIVE",
          amount: verifyCallback.data.amount / 100,
        },
        {
          where: { order_id: razorpay_order_id },
          returning: true,
          raw: true,
        }
      );
      return res.status(200).send({ message: "Transaction Successful!", data: subscription });
    } catch (error) {
      console.log(error)
      return res.status(500).send(errorResponse({ status: 500, message: error.message }))
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function serverFeeSubscription(req, res) {
  try {

    const query = req.query;
    const pagination = await getPagination(req.pagination);
    const whereClause = {};

    if (query.hasOwnProperty("purchaseType")) {
      whereClause.purchaseType = query.purchaseType;
    }
    if (query.hasOwnProperty("status")) {
      whereClause.status = query.status;
    }
    const feeSubscriptions = await Server_subscription.findAndCountAll({
      limit: pagination.limit,
      offset: pagination.offset,
      where: whereClause,
      order: orderBy(req.query)
    });
    const meta = await getMeta(pagination, feeSubscriptions.count);
    return res.status(200).send({ data: feeSubscriptions.rows, meta });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to fetch subscription" });
  }
}

export async function generateServerInvoice(req, res) {
  try {
    const { id } = req.params;
    const subscription = await Server_subscription.findByPk(id, {
      raw: true
    })
    const data = {
      invoice_number: subscription.order_id,
      invoice_date: JSON.parse(JSON.stringify(subscription.createdAt)).split("T")[0],
      amount: subscription.amount,
      payment_id: subscription.payment_id,
      valid_from: JSON.parse(JSON.stringify(subscription.valid_from)).split("T")[0],
      valid_to: JSON.parse(JSON.stringify(subscription.valid_from)).split("T")[0],
      status: subscription.is_paid ? "paid" : "unpaid"
    }
    // return res.status(200).send(data)
    if (!subscription) {
      return res.status(404).send(errorResponse({ status: 404, message: "server subscription not found" }))
    }

    const invoice = await createInvoice(data, "subscription");

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': invoice.length,
      'Content-Disposition': 'attachment; filename="example.pdf"'
    })

    return res.status(200).send(invoice)
  } catch (error) {
    return res.status(500).send(errorResponse({ status: 500, message: error.message }))
  }
}
export async function generateInvoice(req, res) {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByPk(id, {
      include: ["user", "plan"]
    })
    const data = {
      invoice_number: subscription.order_id,
      invoice_date: JSON.parse(JSON.stringify(subscription.createdAt)).split("T")[0],
      amount: subscription.plan.price,
      payment_id: subscription.payment_id,
      valid_from: JSON.parse(JSON.stringify(subscription.valid_from)).split("T")[0],
      valid_to: JSON.parse(JSON.stringify(subscription.valid_from)).split("T")[0],
      status: subscription.is_paid ? "paid" : "unpaid",
      name: subscription.user.name,
      phone: subscription.user.phone,
      plan: subscription.plan.name
    }
    // return res.status(200).send(data)
    if (!subscription) {
      return res.status(404).send(errorResponse({ status: 404, message: "server subscription not found" }))
    }

    const invoice = await createInvoice(data, "user-subscription");

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': invoice.length,
      'Content-Disposition': 'attachment; filename="example.pdf"'
    })

    return res.status(200).send(invoice)
  } catch (error) {
    return res.status(500).send(errorResponse({ status: 500, message: error.message }))
  }
}
