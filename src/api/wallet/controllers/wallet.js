import { getPagination, getMeta } from "../../../services/pagination.js";

import { errorResponse } from "../../../services/errorResponse.js";
import { createActivityLog } from "../../../services/createActivityLog.js";
import { activity_event } from "../../../constants/activity_log.js";
import { mode, purpose, txn_type } from "../../../constants/transaction.js";
import { createTransaction, adminTransaction } from "../../../services/createTrnx.js";
import orderBy from "../../../services/orderBy.js";
import tenantMetric from "../../../services/tenantMetric.js";
import { tenant_metric_fields } from "../../../constants/tenant_metric.js";
import { verify } from "../../../services/jwt.js";
import { default as axios } from "axios";
import sequelize from "../../../../database/index.js";
import User from "../../user/models/user.js";
import Wallet from "../models/wallet.js";
import Global from "../../global/models/global.js";
import Payout_log from "../../payout_log/models/payout_log.js";

export async function create(req, res) {
  const t = await sequelize.transaction();
  try {

    const { UserId, amount, remark, transaction_type } = req.body;
    const findUser = await User.findOne({
      where: { id: UserId },
      include: ["wallets"],
    });
    if (!findUser) {
      return res.status(400).send(errorResponse({ status: 400, message: "no user found!" }))
    }

    const wallet = await Wallet.create({
      UserId: findUser.id,
      amount: amount,
      transaction_type: transaction_type,
      remark,
    }, { transaction: t });

    await findUser.increment({ wallet_balance: amount }, { transaction: t });
    await createActivityLog({ UserId, event: activity_event.WALLET_DEBIT, transaction: t });
    await createTransaction({
      purpose: purpose.ADDED_TO_WALLET,
      amount,
      mode: mode.WALLET,
      UserId,
      transaction: t,
      txn_type: txn_type.DEBIT,
    });
    // await adminTransaction({ subdomain: req.subdomain, purpose: purpose.ADDED_TO_WALLET, mode: mode.MONEY, amount: amount, txn_type: txn_type.CREDIT })
    // await tenantMetric({ subdomain: req.subdomain, field_name: tenant_metric_fields.total_transaction });
    await t.commit();
    return res.status(200).send({ data: { ...wallet.dataValues, total_ballance: findUser.dataValues.wallet_balance } });
  } catch (error) {
    await t.rollback()
    console.log(error);
    return res.status(500).send({ error: 'Failed to create a wallet' });
  }
}

export async function find(req, res) {
  try {

    const query = req.query;
    const order = orderBy(req.query);
    const pagination = await getPagination(query.pagination);
    const wallets = await Wallet.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      order,
      include: [{ model: User, as: "user", attributes: ["id", "name"], include: ["avatar"] }]
    });
    const meta = await getMeta(pagination, wallets.count);
    return res.status(200).send({ data: wallets.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Failed to fetch wallets' });
  }
}

export async function findOne(req, res) {
  try {

    const { id } = req.params;
    const wallet = await Wallet.findByPk(id);
    if (!wallet) {
      return res.status(404).send(errorResponse({ status: 404, message: "Wallet with id not found!" }));
    }
    return res.status(200).send({ data: wallet });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Failed to fetch wallet' });
  }
}

export async function update(req, res) {
  try {

    const { id } = req.params;
    const getwallet = await Wallet.findByPk(id);

    if (!getwallet) {
      return res.status(400).send(errorResponse({ message: "Invalid ID" }));
    }
    const wallet = await Wallet.update(req.body, { where: { id }, returning: true });
    return res.status(200).send({ message: "wallet updated", data: wallet[1][0] });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Failed to fetch wallet' });
  }
}

const _delete = async (req, res) => {
  try {

    const { id } = req.params;
    const getwallet = await Wallet.findByPk(id);

    if (!getwallet) {
      return res.status(400).send(errorResponse({ message: "Invalid ID" }));
    }
    const wallet = await Wallet.destroy({ where: { id } });
    return res.status(200).send({ message: "wallet deleted!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Failed to fetch wallet' });
  }
};
export { _delete };

export async function withdraw(req, res) {
  const t = await sequelize.transaction();
  try {

    const token = verify(req)
    const body = req.body;
    let fund_account

    console.log(body)

    const global = await Global.findOne();
    const user = await User.findByPk(token.id)
    if (global.dataValues.selected_payment_gateway === "NONE") {
      return res.status(400).send(errorResponse({ message: "you can not withdraw wallet money , please use them for purchase" }))
    }

    if (body.mode === "upi") {
      fund_account = {
        "account_type": "vpa",
        "vpa": {
          "address": body.upi_address
        },
      }
    } else {
      fund_account = {
        "account_type": "bank_account",
        "bank_account": {
          "name": user.name,
          "ifsc": body.ifsc,
          "account_number": body.account_number
        },

      }
    }
    console.log(global.razorpayX_account_number)
    if (!global.razorpayX_account_number) {
      return res.status(500).send(errorResponse({
        message: "You can not withdraw wallet balance , please connect with your seller",
        status: 500
      }))
    }

    const data = {
      "account_number": global.razorpayX_account_number,
      "amount": body.amount * 100,
      "currency": "INR",
      "mode": body.mode === "upi" ? "UPI" : "NEFT",
      "purpose": "refund",
      "fund_account": {
        ...fund_account,
        contact: {
          name: user.name,
          contact: user.phone,
          "notes": {
            "notes_key_1": "Wallet Payout",
            "notes_key_2": "Wallet Payout."
          }
        }
      },

      "queue_if_low_balance": true,
      "notes": {
        "notes_key_1": "Account withdrawal",
        "notes_key_2": "Account withdrawal"
      }
    }

    // const user = await User.findByPk(token.id, { attributes: ["wallet_balance", "id"] })
    if (user.wallet_balance < body.amount || global.withdraw_limit < body.amount) {
      return res.status(400).send(errorResponse({
        message: global.withdraw_limit < body.amount ? `amount must be lower or equal to ${global.withdraw_limit}` : "Insufficient Wallet Balance"
      }))
    }

    const tranx = await createTransaction({ sequelize, amount: body.amount, mode: mode.WALLET, purpose: purpose.PURCHASE, UserId: token.id, transaction: t, txn_type: txn_type.DEBIT })
    const username = global.razorpay_key
    const password = global.razorpay_secret
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const authHeader = `Basic ${credentials}`;
    let payout
    try {
      payout = await axios.post("https://api.razorpay.com/v1/payouts", data, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json"
        }
      })
    } catch (error) {
      await t.rollback()
      console.log(error.response.data)
      return res.status(500).send(error.response.data)
    }

    const payout_log = await Payout_log.create({
      payout_id: payout.data.id,
      fund_account_id: payout.data.fund_account_id,
      account_type: payout.data.fund_account.account_type,
      amount: payout.data.amount / 100,
      currency: payout.data.currency,
      mode: payout.data.mode,
      purpose: payout.data.purpose,
      vpa: (body.mode === "upi" ? payout.data.fund_account.vpa.address : null),
      name: payout.data.fund_account.contact.name,
      contact: payout.data.fund_account.contact.contact,
      contact_id: payout.data.fund_account.contact.id,
      status: payout.data.status,
      reference_id: payout.data.reference_id,
      fund_account_id: payout.data.fund_account_id,
      fund_account_contact_id: payout.data.fund_account.contact.id,
      fund_bank_account_ifsc: (body.mode === "bank" ? payout.data.fund_account.bank_account.ifsc : null),
      fund_bank_account_number: (body.mode === "bank" ? payout.data.fund_account.bank_account.account_number : null),
      fund_bank_name: (body.mode === "bank" ? payout.data.fund_account.bank_account.bank_name : null),
      UserId: token.id
    })

    await user.decrement({ wallet_balance: body.amount })
    await t.commit()
    return res.status(200).send({
      message: "withdrawal successfull!", data: {
        amount: payout_log.amount,
        status: payout_log.status, fund_account
      }
    })

  } catch (error) {
    await t.rollback()
    console.log(error)
    return res.status(500).send(error)
  }
}

export async function webHook(ctx) {
  try {
    const body = ctx.request.body

    const secret = "secret123";
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(ctx.request.body));
    const digest = shasum.digest("hex");

    const rzp_signature = ctx.request.headers["x-razorpay-signature"];

    if (digest === rzp_signature) {
      const payoutLog = await strapi.db.query("api::payout-log.payout-log").update({
        data: {
          status: body.payload.payout.entity.status
        }, where: {
          payout_id: body.payload.payout.entity.id
        }
      })
      return ctx.send("OK", 200)

    }

  } catch (error) {
    console.log(error)
    return ctx.send(error, 500)
  }
}
