// Controller function to create a new post

import { tokenError, errorResponse } from "../../../services/errorResponse.js";
import { verify } from "../../../services/jwt.js";
import User from "../../user/models/user.js";
import Global from "./../models/global.js";
import Server_subscription from "./../../server_subscription/models/server_subscription.js";
import { Op } from "sequelize";
import axios from "axios";

export async function create(req, res) {
  try {
    const getglobal = await Global.findAll();

    if (getglobal.length !== 0) {
      const { store_type, ...updatePayload } = req.body;

      const updateGLobal = await Global.update(updatePayload, {
        where: { id: getglobal[0].id },
        returning: true,
      });

      return res
        .status(200)
        .send({ message: "global updated", data: updateGLobal[1][0] });
    } else {
      const global = await Global.create(req.body);
      return res
        .status(200)
        .send({ message: "Global Created Successfully", data: global });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error: "Failed to create/update the global" });
  }
}

export async function find(req, res) {
  try {
    const global = await Global.findOne();
    // const spayGlobal = await axios.get("https://api.spay.hangs.in/api/global")
    // const server_fee = ((spayGlobal.data.data.attributes.client_server_subscription_price / 100) * 18) + spayGlobal.data.data.attributes.client_server_subscription_price
    // const currentDate = new Date();
    // const serverSubscriptions = await Server_subscription.update({ status: "EXPIRED" }, {
    //   where: { status: "ACTIVE", valid_to: { [Op.lt]: currentDate } },
    // })
    // const server_subscriptions = await Server_subscription.findAll({ where: { status: "ACTIVE" }, order: [["valid_to", "asc"]] })
    // let Ssend = (server_subscriptions && server_subscriptions.length ? server_subscriptions[0] : false)

    return res.status(200).send({
      data: { ...global.dataValues },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Failed to fetch globals" });
  }
}
