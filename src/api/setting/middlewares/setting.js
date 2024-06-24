
import Joi from "joi";
import { errorResponse } from "rapidjet"
import store_types from '../../../constants/store_types.js';

export const validateRequest = async (req, res, next) => {
  const JoiSchema = Joi.object({
    "store_mode": Joi.string().valid(...store_types),
    "is_cart_enabled": Joi.boolean().optional(),
    "is_wallet_enabled": Joi.boolean().optional(),
    "is_pricing_enabled": Joi.boolean().optional(),
    "is_app_enabled": Joi.boolean().optional(),
    "is_store_active": Joi.boolean().optional(),
    "is_maintenance_mode": Joi.boolean().optional(),
    "store_inactive_message": Joi.string().optional(),
    "store_maintenance_message": Joi.string().optional(),
  });

  const result = JoiSchema.validate(req.body);

  if (result.error) {
    return res.status(400).send(errorResponse({
      message: result.error.message,
      details: result.error.details
    }));
  }

  await next();
}
