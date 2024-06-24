// controllers/user_metricsController.js
import { errorResponse } from "../../../services/errorResponse.js";
import { getPagination, getMeta } from "../../../services/pagination.js";

export async function create(req, res) {
  try {

    const body = req.body;

    const tenantMetrics = await Tenant_metric.create(body);

    return res.status(200).send({
      message: "User Metrics Created Successfully!",
      data: tenantMetrics,
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
    const userMetrics = await Tenant_metric.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
    });

    const meta = await getMeta(pagination, userMetrics.count);

    return res.status(200).send({ data: userMetrics.rows, meta });
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
    console.log(req);

    const { id } = req.params;

    const tenantMetrics = await Tenant_metric.findOne({
      where: { UserId: id }
    });

    if (!tenantMetrics) {
      return res.status(400).send(errorResponse({ status: 400, message: "Invalid User metrics ID" }));
    }

    return res.status(200).send(tenantMetrics);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export async function update(req, res) {
  try {

    const { id } = req.params;

    const getTenantMetrics = await Tenant_metric.findByPk(id);

    if (!getTenantMetrics) {
      return res.status(400).send(errorResponse({ status: 400, message: "Invalid User metrics ID" }));
    }

    const userMetrics = await getTenantMetrics.update(req.body);

    return res.status(200).send({
      message: "User Metrics Updated Successfully!",
      data: userMetrics,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export const _delete = async (req, res) => {
  try {

    const { id } = req.params;

    const getMetric = await Tenant_metric.findByPk(id);

    if (!getMetric) {
      return res.status(400).send(errorResponse({ status: 400, message: "Invalid User metrics ID" }));
    }

    await getMetric.destroy();

    return res.status(200).send({ message: "User Metrics Deleted Successfully!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
};
