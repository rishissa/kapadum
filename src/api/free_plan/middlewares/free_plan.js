import Joi from "joi";

export function validateFreePlan(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    maxUsers: Joi.number().integer().required(),
    maxProducts: Joi.number().integer().required(),
    codAllowed: Joi.boolean().optional(),
    prepaidAllowed: Joi.boolean().optional(),
    premiumPricing: Joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  next();
}
