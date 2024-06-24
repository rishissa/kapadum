import { getPagination, getMeta } from "../../../services/pagination.js";
import { errorResponse } from "../../../services/errorResponse.js";
import Metric from '../models/metric.js';


export async function create(req, res) {
    try {
        const body = req.body;
        const metric = await Metric.create(req.body);
        return res.status(200).send({ data: metric });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Failed to create a metric" });
    }
}

export async function find(req, res) {
    try {
        const metrics = await Metric.findOne()
        return res.status(200).send({ data: metrics });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Failed to fetch metrics" });
    }
}
