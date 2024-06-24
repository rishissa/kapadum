
import { getPagination, getMeta } from "../../../services/pagination.js";
import { errorResponse } from "../../../services/errorResponse.js";
import Plan from './../models/plan.js';
import sequelize from "../../../../database/index.js";

export async function find(req, res) {
  try {

    const query = req.query;
    const pagination = await getPagination(query.pagination);

    let whereClause = {}
    if (query.hasOwnProperty("active")) {
      (query.active === "true" ? whereClause.is_active = true : query.active === "false" ? whereClause.is_active = false : "")
    }

    let plans = await Plan.findAndCountAll({
      where: whereClause,
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM "Subscriptions" WHERE "Subscriptions"."PlanId" = "Plan"."id")'), "subscriptions"],
        ],
      },
      limit: pagination.limit,
      offset: pagination.offset,
    });

    const meta = await getMeta(pagination, plans.count);

    return res.status(200).send({ data: plans.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({
      status: 500,
      message: "Internal server Error",
      details: error.message,
    }));
  }
}

export async function create(req, res) {
  try {
    const plan = await Plan.create(req.body);
    return res.status(200).send({ data: plan });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Internal server Error", details: error.message }));
  }
}

export async function findOne(req, res) {
  try {

    const { id } = req.params;
    const plan = await Plan.findByPk(id, {
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM "Subscriptions" WHERE "Subscriptions"."PlanId" = "Plan"."id")'), "subscriptions"],
        ],
      },
    });

    if (plan) {
      return res.status(200).send({ data: plan });
    } else {
      return res.status(404).send(errorResponse({ message: "Plan not found", status: 404 }));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export async function update(req, res) {
  try {

    const { id } = req.params;
    const existingPlan = await Plan.findByPk(id);

    if (existingPlan) {
      await Plan.update(req.body, {
        where: { id },
      });
      return res.status(200).send({ message: "Plan updated successfully!" });
    } else {
      return res.status(404).send(errorResponse({ error: "Plan not found" }));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export const _delete = async (req, res) => {
  try {

    const { id } = req.params;
    const existingPlan = await Plan.findByPk(id);

    if (existingPlan) {
      await Plan.destroy({ where: { id } });
      return res.status(200).send({ message: `Plan with id-${id} deleted successfully!` });
    } else {
      return res.status(404).send(errorResponse({ error: "Plan not found" }));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
};
