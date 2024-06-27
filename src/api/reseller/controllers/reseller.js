import { Op } from "sequelize";
import sequelize from "../../../../database/index.js";
import { errorResponse, tokenError } from "../../../services/errorResponse.js";
import { verify } from "../../../services/jwt.js";
import { getPagination, getMeta } from "../../../services/pagination.js";
import Role from "../../role/models/role.js";
import User from "../../user/models/user.js";
import ResellerInfo from "../models/reseller.js";
import AccountDetails from "../models/reseller.js";
import Address from "../models/reseller.js";
import { hash } from "../../../services/bcrypt.js";
import ResellerBanner from "../../reseller_banner/models/reseller_banner.js";
import Media from "../../upload/models/media.js";
import ResellerCategory from "../../reseller_category/models/reseller_category.js";
import ImportedProduct from "../../product/models/imported_product.js";
import Variant from "../../variant/models/variant.js";
import checkBulkPricing from "../../order/services/bulkPricingChecker.js";
import shippingPriceChecker from "../../order/services/shippingPriceChecker.js";
import { createOrderVaraint } from "../../order/services/createOV.js";
import Order_variant from "../../order_variant/models/order_variant.js";
import Order from "../../order/models/order.js";

export async function create(req, res) {
  const t = await sequelize.transaction();
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

    const reseller_role = await Role.findOne({
      where: { name: "Reseller" },
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
      RoleId: reseller_role.id,
      AvatarId: body.AvatarId,
    });

    //create record in reseller info
    const reseller_info = await ResellerInfo.create({ UserId: user.id });
    // const htmlContent = readFileSync("./views/accountCreated.ejs", "utf8");
    // const renderedContent = render(htmlContent, { name, task: "Created" });
    await t.commit();
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
    // const emailsend = await mailSender.mailSender({
    //   to: email,
    //   subject: "Your account has been created ",
    //   html: renderedContent,
    // });

    return res.status(200).send({
      message: "User Created Successfully!",
      data: { name, email, phone },
    });
  } catch (error) {
    console.log(error.message);
    await t.rollback();
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export async function find(req, res) {
  try {
    const query = req.query;
    const reseller_role = await Role.findOne({
      where: { name: "Reseller" },
    });

    const pagination = await getPagination(query.pagination);
    const resellers = await User.findAndCountAll({
      limit: pagination.limit,
      offset: pagination.offset,
      where: {
        RoleId: reseller_role.id,
      },
      include: [{ model: ResellerInfo, as: "reseller" }],
    });
    const meta = await getMeta(pagination, resellers.count);
    return res.status(200).send({ data: resellers.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Some internal server error ocured!",
      })
    );
  }
}

export async function findOne(req, res) {
  try {
    const id = req.params.id;
    const address = await Address.findOne({
      where: { id: id },
    });
    if (!address) {
      return res.status(404).send(
        errorResponse({
          status: 404,
          message: "Address Not Found!",
          details: "address id seems to be invalid",
        })
      );
    }
    return res.status(200).send({ data: address });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Some internal server error ocured!",
      })
    );
  }
}

export async function update(req, res) {
  try {
    const id = req.params.id;
    const updateAccountDetails = await AccountDetails.update(req.body, {
      where: { id: id },
      returning: true,
    });

    return res.status(200).send({
      message: "AccountDetails Updated Successfully!",
      data: updateAccountDetails[1][0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Some internal server error ocured!",
      })
    );
  }
}

export const _delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedRowCount = await AccountDetails.destroy({
      where: { id: id },
    });
    if (deletedRowCount === 0) {
      return res.status(404).send(
        errorResponse({
          status: 404,
          message: "Account Not Found!",
          details: "Account id seems to be invalid",
        })
      );
    }
    return res.status(200).send({ message: "Account Deleted Successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Some internal server error ocured!",
      })
    );
  }
};

export async function getData(req, res) {
  try {
  } catch (err) {
    console.log(err.message);
    return res.status(200).send(err.message);
  }
}

export async function fetchResellerProducts(req, res) {
  try {
    const id = req.params.id;
    const user = await User.findOne({
      where: { id: id },
      attributes: ["id", "email"],
      include: [
        {
          model: Variant,
          as: "imported_products",
          // through: { attributes: [] },
          include: [
            { model: Media, as: "thumbnail", attributes: ["url"] },
            { model: Media, as: "gallery", attributes: ["url"] },
          ],
        },
      ],
    });

    return res.status(200).send(user.imported_products);
  } catch (err) {
    console.log(err.message);
    return res
      .status(400)
      .send(errorResponse({ status: 400, message: err.message }));
  }
}

export async function fetchResellerBanners(req, res) {
  try {
    const banner = await ResellerBanner.findAll({
      where: { UserId: req.params.id },
      include: [
        { model: Media, as: "mobile_thumbnail", attributes: ["url"] },
        { model: Media, as: "desktop_thumbnail", attributes: ["url"] },
      ],
    });
    return res.status(200).send({ data: banner });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: error.message,
        details: "some internal server error occured!",
      })
    );
  }
}

export async function fetchResellerCategories(req, res) {
  try {
    const categories = await ResellerCategory.findAll({
      where: { UserId: req.params.id },
      include: [{ model: Media, as: "thumbnail", attributes: ["url"] }],
    });

    return res.status(200).send(categories, 200);
  } catch (err) {
    console.log(err.message);
    return res.status(400).send(err.message);
  }
}

export async function resellerOrder(req, res) {
  try {
    const body = req.body;
    const variants = body.variants;
    const user = req.user;
    const variants_details = req.variants_arr;
    const t = await sequelize.transaction();
    let { totalAmount, variantsPrice } = await checkBulkPricing({
      user,
      variants,
      variants_details,
    });
    const shippingPrice = await shippingPriceChecker({
      global,
      variantsArray: variants_details,
      variantsPrice,
    });
    totalAmount += shippingPrice;

    //check if wallet has totalAmount
    if (totalAmount > res.user_data.wallet_balance) {
      return res.status(400).send({
        message: `Wallet Doesn't have enough balance: Available Balance: ${res.user_data.wallet_balance}`,
      });
    }
    body.consumer.isResellerOrder = true;
    const order_id = await createOrderVaraint({
      body,
      // razorpayOrder: rzOrder,
      // sequelize,
      transaction: t,
      user,
      // variants_details,
      variantsPrice,
      totalAmount,
    });

    let imported_products = variants.map((v) => {
      return {
        reselling_price: v.sellingPrice,
        UserId: res.user,
        VariantId: v.VariantId,
      };
    });
    //add imported products
    const importProducts = await ImportedProduct.bulkCreate(imported_products);
    //deduct wallet amount
    const updateWallet = await User.update(
      { wallet_balance: res.user_data.wallet_balance - totalAmount },
      {
        where: { id: res.user },
      },
      { transaction: t }
    );
    await t.commit();
    return res.status(200).send({ data: { totalAmount, variantsPrice } });
  } catch (err) {
    console.log(err.message);
    return res
      .status(400)
      .send(errorResponse({ status: 400, message: err.message }));
  }
}

export async function searchResellers(req, res) {
  try {
    const key = req.params.key;
    const query = req.query;

    const pagination = await getPagination(query.pagination);

    const reseller_role = await Role.findOne({
      where: { name: "Reseller" },
    });
    const resellers = await User.findAndCountAll({
      limit: pagination.limit,
      offset: pagination.offset,
      where: {
        [Op.and]: [
          { RoleId: reseller_role.id },
          {
            [Op.or]: [
              { name: { [Op.iLike]: `%${key}%` } },
              { phone: { [Op.match]: key } },
              { email: { [Op.match]: key } },
            ],
          },
        ],
      },
      include: [{ model: ResellerInfo, as: "reseller" }],
    });
    const meta = await getMeta(pagination, resellers.count);
    return res.status(200).send({ data: resellers.rows, meta });
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
}

export async function redirectToAppReseller(req, res) {
  try {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Redirecting...</title>
        <script type="text/javascript" src="/public/redirect.js" defer>
        </script>
            <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            text-align: center;
            font-weight: bold;
            font-size: 5rem;
        }

        .continue {
            color: green;
        }
    </style>
    </head>
    <body>
        <p>Click <span class="continue">"Continue"</span> to proceed to the reseller store in app</p>
        <p id="error" style="color: red;"></p>
    </body>
    </html>
  `;

    return res.status(200).send(html, 200);
  } catch (err) {
    console.log(err);
    return res.status(400).send(errorResponse({ message: err.message }));
  }
}

export async function fetchResellerOrders(req, res) {
  try {
    const id = res.user;
    const user = await User.findOne({
      where: { id: id },
      attributes: ["id", "email"],
      include: [
        {
          model: Order,
          as: "orders",
        },
      ],
    });

    return res.status(200).send(user);
  } catch (err) {
    console.log(err.message);
    return res.status(400).send(err.message);
  }
}
