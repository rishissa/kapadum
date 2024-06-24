import { readFileSync } from "fs";
import { render } from "ejs";
import firebaseAdmin from "firebase-admin";
import { Op } from "sequelize";
import mailSender from "../../../services/emailSender.js";
import { getPagination, getMeta } from "../../../services/pagination.js";
import orderBy from "../../../services/orderBy.js";
import { issue, verify } from "../../../services/jwt.js";
import { hash, compare } from "../../../services/bcrypt.js";
import { tokenError, errorResponse } from "../../../services/errorResponse.js";
import { createActivityLog } from "../../../services/createActivityLog.js";
import tenantMetric from "../../../services/tenantMetric.js";
import { tenant_metric_fields } from "../../../constants/tenant_metric.js";
import { activity_event } from "../../../constants/activity_log.js";
import { generateOTP, isPremiumUser } from "../services/user.js";
import User from "../models/user.js";
import Order_variant from "../../order_variant/models/order_variant.js";
import Product from "../../product/models/product.js";
import Plan from "../../plan/models/plan.js";
import Transaction from "../../transaction/models/transaction.js";
import Lead from "../../lead/models/lead.js";
import Return_order from "../../return_order/models/return_order.js";
import Subscription from "../../subscription/models/subscription.js";
import Order from "../../order/models/order.js";
import Category from "../../category/models/category.js";
import Role from "./../../role/models/role.js";
import sequelize from "../../../../database/index.js";
import Product_metric from "../../product_metrics/models/product_metrics.js";
import Variant from "./../../variant/models/variant.js";
import role from "../../../constants/role.js";
import ResellerInfo from "../../reseller/models/reseller.js";

export async function create(req, res) {
  try {
    const body = req.body;
    const { name, email, phone, username } = body;
    const trimedPhone = phone.trim().split(" ").join("").slice(-10);
    const findUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { phone: trimedPhone },
          { username: username.trim() },
        ],
      },
    });
    if (findUser) {
      const matching_value = Object.entries(findUser.dataValues).find(
        ([key, value]) =>
          value === email || value === trimedPhone || value === username
      );
      console.log(matching_value);
      return res.status(400).send(
        errorResponse({
          message: `User Already Exists with the ${matching_value[0]} ${matching_value[1]}`,
        })
      );
    }

    const consumer_role = await Role.findOne({
      where: { name: "Consumer" },
      raw: true,
    });

    let hashPass = "";
    if (req.body.password) {
      hashPass = await hash(req.body.password);
    }
    const user = await User.create({
      username: username?.trim(),
      name: name?.trim(),
      email: email?.trim(),
      phone: trimedPhone,
      password: hashPass,
      RoleId: consumer_role.id,
      AvatarId: body.AvatarId,
    });

    //create record in reseller info
    const htmlContent = readFileSync("./views/accountCreated.ejs", "utf8");
    const renderedContent = render(htmlContent, { name, task: "Created" });
    // code to send fcm
    // const token = "fJTTL0EVXZo6_tdNsUytRY:APA91bH5LstGlPSY_LQPfP8hFCDpIUmYF8o4Ct5qR1vgctcxYxTRfVscCRsjmscoOdSEuO8skY3MgKrQ7k5VBeRe-vgmvC9oXnPlP7Pc65UQTyoI0F5Vvd-vo5fa99lIDIFVNUd5WHI6";

    // const message = {
    //   notification: {
    //     title: "user Created  successfullY!",
    //     body: "now you can enjoy shopping",
    //   },
    //   token,
    // };

    // const sendMessage = await firebaseAdmin.messaging().send(message);
    // await tenantMetric({ subdomain: req.subdomain, field_name: tenant_metric_fields.total_users });
    const emailsend = await mailSender.mailSender({
      to: email,
      subject: "Your account has been created ",
      html: renderedContent,
    });

    return res.status(200).send({
      message: "User Created Successfully!",
      data: { name, email, phone },
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export async function update(req, res) {
  try {
    const id = req.params.id;
    const [updatedRowsCount, [updatedUserStore]] = await User.update(req.body, {
      where: { id: id },
      returning: true,
    });
    if (updatedRowsCount === 0) {
      return res
        .status(404)
        .send(errorResponse({ status: 404, message: "User Not found!" }));
    }
    return res.status(200).send({
      message: "User Updated Successfully!",
      data: updatedUserStore,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export async function find(req, res) {
  try {
    const query = req.query;
    const pagination = await getPagination(query.pagination);
    const whereClause = {};
    if (query.hasOwnProperty("role")) {
      whereClause.name = query?.role;
    }
    const user = await User.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      include: ["avatar", { model: Role, as: "role", where: whereClause }],
      attributes: {
        exclude: ["password", "password_reset_token"],
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM "Orders" WHERE "Orders"."UserId" = "User"."id" AND "Orders"."payment_mode" = \'PREPAID\')'
            ),
            "prepaid_orders",
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM "Orders" WHERE "Orders"."UserId" = "User"."id" AND "Orders"."payment_mode" = \'COD\')'
            ),
            "cod_orders",
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM "Orders" WHERE "Orders"."UserId" = "User"."id" AND "Orders"."payment_mode" = \'WALLET\')'
            ),
            "wallet_orders",
          ],
        ],
      },
    });

    // const metrics = await Order_variant.findAll({
    //   include: [
    //     { model: Order, as: "order", where: { UserId: UserId } }
    //   ]
    // })

    const meta = await getMeta(pagination, user.count);
    return res.status(200).send({ data: user.rows, meta });
  } catch (error) {
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
    const user = await User.findOne({
      where: { id: id },
      include: ["avatar"],
    });
    if (!user) {
      return res
        .status(404)
        .send(errorResponse({ status: 404, message: "User Not found!" }));
    }
    return res.status(200).send({ data: user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export const _delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedRowCount = await User.destroy({
      where: { id: id },
    });
    if (deletedRowCount === 0) {
      return res
        .status(404)
        .send(errorResponse({ status: 404, message: "User Not found!" }));
    }
    return res.status(200).send({ message: "User Deleted Successfully!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
};

export async function search(req, res) {
  try {
    const query = req.query;
    const qs = query.qs;
    const pagination = await getPagination(query.pagination);
    const order = orderBy(query);
    const users = await User.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      order: order,
      where: {
        [Op.or]: [
          {
            name: { [Op.iLike]: `%${qs}%` },
          },
          {
            email: { [Op.iLike]: `%${qs}%` },
          },
        ],
      },
      include: [
        "addresses",
        "avatar",
        {
          model: Role,
          where: {
            [Op.and]: [{ name: { [Op.notIn]: ["Super_Admin", "Admin"] } }],
          },
          as: "role",
          attributes: [],
        },
      ],
    });
    const meta = await getMeta(pagination, users.count);
    return res.status(200).send({ data: users.rows, meta });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({
      where: { email: email },
      include: ["avatar", { model: Role, as: "role", attributes: ["name"] }],
    });

    if (!findUser) {
      return res
        .status(400)
        .send(errorResponse({ status: 404, message: "User Not Found!" }));
    }

    const isPremium = await isPremiumUser({ id: findUser.dataValues.ids });
    const isMatched = await compare(password, findUser.dataValues.password);
    if (!isMatched) {
      return res
        .status(404)
        .send(errorResponse({ status: 404, message: "User Not found!" }));
    }
    const token = issue({ id: findUser.id });
    await createActivityLog({
      sequelize,
      event: activity_event.USER_LOG_IN,
      UserId: findUser.id,
    });
    delete findUser.password;
    return res.status(200).send({
      data: { jwt: token, user: { ...findUser.dataValues, isPremium } },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: error.message }));
  }
}

export async function getMe(req, res) {
  try {
    const token = verify(req);
    if (token.error) {
      return res.status(401).send(tokenError(token));
    }
    const findUser = await User.findOne({
      where: { id: token.id },
      attributes: { exclude: ["password", "password_reset_token"] },
      include: ["addresses", "avatar"],
    });
    const subscriptions = await Subscription.findAll({
      where: { UserId: token.id, status: "ACTIVE" },
      order: [["valid_to", "asc"]],
      include: ["plan"],
    });
    const currentDate = new Date();
    let isPremium;
    if (subscriptions.length) {
      const expiredSubscriptions = subscriptions.filter((subscription) => {
        const validToDate = new Date(subscription.valid_to);
        return validToDate < currentDate;
      });
      isPremium = await isPremiumUser({ id: token.id, sequelize });
      findUser.isPremium = true;
      await findUser.save();
      const expiredSubscriptionIds = expiredSubscriptions.map(
        (subscription) => subscription.id
      );
      await Subscription.update(
        { status: "EXPIRED" },
        {
          where: { id: expiredSubscriptionIds },
        }
      );
    } else {
      findUser.isPremium = false;
      await findUser.save();
    }
    return res.status(200).send({
      data: {
        ...findUser.dataValues,
        subscription: subscriptions.length ? subscriptions[0] : null,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export async function forgetPassword(req, res) {
  try {
    const { email } = req.body;

    const crypto = require("crypto");
    const password_reset_token = crypto.randomBytes(16).toString("hex");

    const user = await User.findOne({ where: { email } });

    if (user) {
      const [updatedRowsCount, [updatedUser]] = await User.update(
        { password_reset_token: password_reset_token },
        {
          where: { email },
          returning: true,
        }
      );
      const name = updatedUser.name;
      // const userEmail = updatedUser.email;
      const userEmail = "patelnarayan83499@gmail.com";
      const htmlContent = readFileSync(
        "./views/verifyResetPassword.ejs",
        "utf8"
      );
      const renderedContent = render(htmlContent, {
        name,
        href: `http://localhost:4500`,
      });
      // await sendEmail(userEmail, renderedContent);
      mailSender({
        to: userEmail,
        subject: "User Password Reset",
        html: renderedContent,
      });
      return res.status(200).send({
        message: `Email with reset link has been sent to ${
          userEmail.slice(0, 4) + "********" + userEmail.slice(-5)
        } `,
      });
    } else {
      return res.status(400).send(errorResponse({ message: "Invalid Email" }));
    }
  } catch (error) {
    console.log("Error in initiateResetPassword:", error);
    return res.status(500).send({
      status: 500,
      message: "Internal server Error",
      details: error.message,
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, password_reset_token } = req.query;

    const user = await User.findOne({
      where: { email: email },
    });

    if (user) {
      if (password_reset_token === user.password_reset_token) {
        const { password } = req.body;
        user.update({ password: password }, { returning: true });
        console.log(user);
        return res.status(200).send({ data: user });
      } else {
        return res
          .status(400)
          .send(errorResponse({ message: "Invalid Request!" }));
      }
    } else {
      return res.status(400).send(
        errorResponse({
          message: "Invalid Email",
          details: "Given email does not exists",
        })
      );
    }
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

export async function register_FCM(req, res) {
  try {
    const token = verify(req);

    if (token.error) {
      return res.status(400).send(tokenError(token));
    }
    const user = await User.update(req.body, { where: { id: token.id } });
    return res
      .status(200)
      .send({ message: "FCM Token for notification registered!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function dashboard(req, res) {
  try {
    const [
      orders,
      products,
      categories,
      users,
      leads,
      return_orders,
      plans,
      subscriptions,
      revenue,
      shares,
      rto_orders,
      out_of_stock,
    ] = await Promise.all([
      await Order_variant.count({
        include: [{ model: Order, as: "order", where: { is_paid: true } }],
      }),
      await Product.count({ where: { is_active: true } }),
      await Category.count(),
      await User.count(),
      await Lead.count(),
      await Return_order.count(),
      await Plan.count(),
      await Subscription.count(),
      await Transaction.sum("amount"),
      await Product_metric.sum("shares_count"),
      await Order_variant.count({ where: { status: "RETURN_RECEIVED" } }),
      await Product.count({
        distinct: true,
        include: [
          {
            model: Variant,
            as: "variants",
            where: {
              quantity: 0,
            },
          },
        ],
      }),
    ]);

    return res.status(200).send({
      data: {
        orders,
        products,
        categories,
        users,
        leads,
        return_orders,
        plans,
        subscriptions,
        revenue,
        shares,
        rto_orders,
        out_of_stock,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ message: error.message, status: 500 }));
  }
}

export async function sendLoginOTP(req, res) {
  try {
    const { phone } = req.body;
    const templateID = "656ec220d6fc0550c2082f12";
    const url = "https://control.msg91.com/api/v5/flow/";
    const findUser = await User.findOne({
      where: { phone: phone?.slice(-10) },
    });
    const otp = generateOTP(6);
    let date = new Date();
    const otp_expiration = date.setMinutes(date.getMinutes() + 10);

    if (findUser) {
      await findUser.update({ otp: otp, otp_expiration: otp_expiration });
    } else {
      const role = await Role.findOne({
        where: { name: "Consumer" },
      });
      const user = await User.create({
        data: {
          phone: phone,
          RoleId: role.id,
          otp: otp,
          otp_expiration: otp_expiration,
        },
      });
    }

    const reqBody = {
      template_id: templateID,
      short_url: 0,
      recipients: [
        {
          mobiles: "+91" + phone,
          var1: otp,
        },
      ],
    };

    const send_sms = await axios.post(url, reqBody, {
      headers: {
        authkey: "275588AIHmHWVyjtu5cd18c59",
      },
    });

    return res.status(200).send({
      message: "OTP has been sent to your phone number",
      status: send_sms.status,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: error.message }));
  }
}

export async function verifyLoginOTP(req, res) {
  try {
    const { phone, otp } = req.body;
    const sequelize = req.db;
    const findUser = await User.findOne({
      where: { phone: phone?.slice(-10) },
    });
    if (!findUser) {
      return res
        .status(400)
        .send(errorResponse({ status: 404, message: "User Not Found!" }));
    }

    if (findUser.otp !== otp)
      return res
        .status(400)
        .send(errorResponse({ status: 400, message: "Invalid OTP" }));
    if (findUser.otp_expiration < Date.now()) {
      return res.status(400).send(errorResponse({ message: "OTP Expired" }));
    }
    const isPremium = await isPremiumUser({
      id: findUser.dataValues.id,
      sequelize,
    });
    await findUser.update({ otp: null });
    const token = issue({ id: findUser.id });
    await createActivityLog({
      sequelize,
      event: activity_event.USER_LOG_IN,
      StoreUserId: findUser.id,
    });
    delete findUser.password;
    return res.status(200).send({
      data: { jwt: token, user: { ...findUser.dataValues, isPremium } },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: error.message }));
  }
}
