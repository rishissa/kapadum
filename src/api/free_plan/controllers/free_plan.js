// controllers/freePlanController.js

import { errorResponse } from "../../../services/errorResponse.js";

import Free_plan from './../models/free_plan.js';
export async function create(req, res) {
  try {

    const getFreePlan = await Free_plan.findOne();

    if (getFreePlan) {
      const updateFreePlan = await Free_plan.update(req.body, {
        where: { id: getFreePlan.id },
        returning: true,
      });

      return res.status(200).send({ message: "Free plan updated", data: updateFreePlan[1][0] });
    } else {
      const freePlan = await Free_plan.create(req.body);
      return res.status(200).send({ message: "Free plan Created Successfully", data: freePlan });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
  }
}


export async function find(req, res) {
  try {

    const freePlan = await Free_plan.findOne();
    return res.status(200).send({ data: freePlan });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error" }));
  }
}
