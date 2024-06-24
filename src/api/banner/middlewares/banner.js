import Joi from "joi";
import { errorResponse } from "../../../services/errorResponse.js";

export async function validateRequest(req, res, next) {
  const JoiSchema = Joi.object({
    action: Joi.string().valid("LINK", "PRODUCT", "COLLECTION"),
    data: Joi.string().required(),
    MobileThumbnailId: Joi.number().required(),
    DesktopThumbnailId: Joi.number().required(),
  });

  let result = JoiSchema.validate(req.body);

  if (result.error) {
    return res.status(400).send(errorResponse({ message: result.error.message, details: result.error.details }));
  } else {
    await next();
  }
}
