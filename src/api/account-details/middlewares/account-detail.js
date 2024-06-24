import Joi from "joi";
import { errorResponse } from "../../../services/errorResponse.js";
export async function addAccountDetails(req, res, next) {
  const schema = Joi.object({
    bank_name: Joi.string().optional(),
    account_number: Joi.string().optional(),
    ifsc_code: Joi.string().optional(),
    upi_id: Joi.string().optional(),
  });

  let result = schema.validate(req.body);
  if (result.error) {
    return res.status(400).send(
      errorResponse({
        status: 400,
        message: result.error.message,
        details: result.error.details,
      })
    );
  }
  await next();
}
export async function updateAccountDetails(req, res, next) {
  const schema = Joi.object({
    bank_name: Joi.string().optional(),
    account_number: Joi.string().optional(),
    ifsc_code: Joi.string().optional(),
    upi_id: Joi.string().optional(),
  });

  let result = schema.validate(req.body);
  if (result.error) {
    return res.status(400).send(
      errorResponse({
        status: 400,
        message: result.error.message,
        details: result.error.details,
      })
    );
  }
  await next();
}
