import Joi from "joi";
import { errorResponse } from "../../../services/errorResponse.js";

export async function validateCreateTutorial(req, res, next) {
  function validate(body) {
    const tutorialSchema = Joi.object({
      ThumbnailId: Joi.number().allow(null),
      name: Joi.string().required(),
      video_url: Joi.string().required(),
      description: Joi.string().required(),
    });

    return tutorialSchema.validate(body);
  }

  const result = validate(req.body);
  if (result.error) {
    return res.status(400).send(
      errorResponse({
        status: 400,
        message: result.error.message,
        details: result.error.details,
      })
    );
  } else {
    await next();
  }
}
export async function validateUpdateTutorial(req, res, next) {
  function validate(body) {
    const tutorialSchema = Joi.object({
      ThumbnailId: Joi.number().allow(null),
      name: Joi.string().optional(),
      video_url: Joi.string().optional(),
      description: Joi.string().optional(),
    });

    return tutorialSchema.validate(body);
  }

  const result = validate(req.body);
  if (result.error) {
    return res.status(400).send(
      errorResponse({
        status: 400,
        message: result.error.message,
        details: result.error.details,
      })
    );
  } else {
    await next();
  }
}
