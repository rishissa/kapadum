import { getPagination, getMeta } from "../../../services/pagination.js";
import { errorResponse } from "../../../services/errorResponse.js";

/**
 * Create a new Plan_metrics
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function create(req, res) {
  try {

    const body = req.body;
    const planMetrics = await Plan_metrics.create({
      subscribers_count: body.subscribers_count,
      revenue_generated: body.revenue_generated,
      PlanId: body.PlanId,
    });
    return res.status(201).send({
      message: "Plan_metrics created successfully!",
      data: planMetrics,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

/**
 * Find all Plan_metrics
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function find(req, res) {
  try {

    const query = req.query;
    const pagination = await getPagination(query.pagination);
    const planMetrics = await Plan_metrics.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
    });
    const meta = await getMeta(pagination, planMetrics.count);
    return res.status(200).send({ data: planMetrics.rows, meta });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

/**
 * Find a specific Plan_metrics by ID
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function findOne(req, res) {
  try {

    const { id } = req.params;
    const planMetrics = await Plan_metrics.findByPk(id);
    if (!planMetrics) {
      return res.status(404).send(errorResponse({ error: "Plan_metrics not found" }));
    }
    return res.status(200).send(planMetrics);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

/**
 * Update a Plan_metrics
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function update(req, res) {
  try {

    const { id } = req.params;
    const getPlanMetrics = await Plan_metrics.findByPk(id);
    if (getPlanMetrics) {
      const updatedPlanMetrics = await Plan_metrics.update(req.body, {
        where: { id },
        returning: true,
      });
      return res.status(200).send({
        message: "Plan_metrics updated successfully!",
        data: updatedPlanMetrics[1][0],
      });
    } else {
      return res.status(404).send(
        errorResponse({
          error: "Plan_metrics not found",
          details: "Requested Plan_metrics Id Does not exist",
        })
      );
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

/**
 * Delete a Plan_metrics
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const _delete = async (req, res) => {
  try {

    const { id } = req.params;
    const getPlanMetrics = await Plan_metrics.findByPk(id);
    if (!getPlanMetrics) {
      return res.status(404).send(errorResponse({ error: "Plan_metrics not found" }));
    }
    await Plan_metrics.destroy({
      where: { id },
    });
    return res.status(200).send({ message: "Plan_metrics deleted successfully!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
};
