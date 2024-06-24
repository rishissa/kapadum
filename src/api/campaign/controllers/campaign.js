import sequelize from "../../../../database/index.js";
import { activity_event } from "../../../constants/activity_log.js";
import { createActivityLog } from "../../../services/createActivityLog.js";
import { errorResponse } from "../../../services/errorResponse.js";
import { verify } from "../../../services/jwt.js";
import { getPagination, getMeta } from "../../../services/pagination.js";
import Notification from "../../notification/models/notification.js";
import Media from "../../upload/models/media.js";
import Campaign from "../models/campaign.js";
import campaign from "../services/campaign.js";


export async function create(req, res) {
  const t = await sequelize.transaction();
  try {

    const token = verify(req);
    const body = req.body;
    const { notification_title, notification_body, NotificationImageId, web_notification, app_notification, type } = body
    const image = await Media.findByPk(NotificationImageId, { raw: true })
    if (!image) {
      return res.status(400).send(errorResponse({ message: "Invalid Image ID" }))
    }
    let image_url = "http://" + req.hostname + ":4500" + image.url
    const Createcampaign = await Campaign.create({ ...req.body, image_url: image.url }, { transaction: t });
    await campaign({
      title: notification_title,
      body: notification_body,
      app_notification,
      web_notification,
      imageUrl: image_url,
      // imageUrl: "https://media.macphun.com/img/uploads/customer/how-to/608/15542038745ca344e267fb80.28757312.jpg?q=85&w=1340",
      targetType: "topic",
      topic: "test_topic"
    })
    const notification = await Notification.create({
      title: notification_title,
      desctiption: notification_body,
      type: type,
      isRead: false,
      data: null,
    }, { transaction: t })
    await createActivityLog({ event: activity_event.NEW_CAMPAIGN_ADDED, sequelize, UserId: token.id, transaction: t })
    await t.commit();
    return res.status(200).send({ message: "Campaign Created Successfully!", data: Createcampaign });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res.status(500).send(errorResponse({ message: "Failed to create a campaign", status: 500 }));
  }
}


export async function update(req, res) {
  try {

    const id = req.params.id;
    const [updatedRowsCount, updatedCampaign] = await Campaign.update(req.body, {
      where: { id: id },
      returning: true,
    });
    if (updatedRowsCount === 0) {
      return res.status(404).send(errorResponse({ status: 400, message: "Campaign not found" }));
    }
    return res.status(200).send({
      message: "Campaign Updated Successfully!",
      data: updatedCampaign[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Failed to update the campaign" }));
  }
}


export async function find(req, res) {
  try {

    const query = req.query;
    const pagination = await getPagination(query.pagination);
    const campaigns = await Campaign.findAndCountAll({
      limit: pagination.limit,
      offset: pagination.offset,
    });
    const meta = await getMeta(pagination, campaigns.count);
    return res.status(200).send({ data: campaigns.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ message: "Failed to fetch campaigns", status: 500 }));
  }
}


export async function findOne(req, res) {
  try {

    const campaignId = req.params.id;
    const campaign = await Campaign.findOne({
      where: { id: campaignId },
    });
    if (!campaign) {
      return res.status(404).send(errorResponse({ status: 400, message: "Campaign not found" }));
    }
    return res.status(200).send({ data: campaign });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ message: "Failed to fetch the campaign", status: 500 }));
  }
}


const _delete = async (req, res) => {
  try {

    const campaignId = req.params.id;
    const deletedRowCount = await Campaign.destroy({
      where: { id: campaignId },
    });
    if (deletedRowCount === 0) {
      return res.status(404).send(errorResponse({ message: "Campaign not found" }));
    }
    return res.status(200).send({ message: "Campaign Deleted Successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ message: "Failed to delete the campaign", status: 500 }));
  }
};
export { _delete };
