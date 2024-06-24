import Joi from "joi";
import { Op } from "sequelize";
import { verify } from "../../../services/jwt.js";
import { errorResponse, tokenError } from "../../../services/errorResponse.js";
import { getDate } from "../../../services/date.js";
import Plan from "../../plan/models/plan.js";
import User from "../../user/models/user.js";
import Subscription from "../models/subscription.js";

export async function validateRequest(req, res, next) {
  function validate(body) {
    const JoiSchema = Joi.object({
      PlanId: Joi.number().required().positive(),
      UserId: Joi.number().required().positive(),
    });
    return JoiSchema.validate(body);
  }

  let result = validate(req.body);
  if (result.error) {
    return res.status(400).send(errorResponse({ message: result.error.message, details: result.error.details }));
  }
  next();
}
export async function checkPlan(req, res, next) {
  try {

    if (!req.body.hasOwnProperty("plan_id"))
      return res.status(400).send(errorResponse({
        status: 400,
        message: "Bad Request!",
        details: "plan_id is required please provide!",
      }));
    const plan_id = req.body.plan_id;
    const plan = await Plan.findByPk(plan_id);
    if (plan.is_active) {
      req.plan_day = plan.validity;
      await next();
    } else {
      return res.status(400).send(errorResponse({
        status: 400,
        message: "Bad Request!",
        details: "Invalid Plan Id ",
      }));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send(errorResponse({
      status: 400,
      message: "Bad Request!",
      details: "Invalid Plan Id ",
    }));
  }
}

export async function checkExistingSubscription(req, res, next) {
  try {
    const token = verify(req);
    if (token.error) {
      return res.status(401).send(tokenError(token))
    }
    const user = await User.findByPk(token.id, {
      distinct: true,
      include: [
        {
          model: Subscription,
          as: "subscriptions",
          where: {
            [Op.and]: [{
              valid_to: {
                [Op.gt]: getDate(),
              },
              is_paid: true,
            }],
          },
          include: ["plan"],
        },
        // Unconditional association for subscriptions
        {
          model: Subscription,
          as: "subscriptions",
          required: false, // This makes it not required
        },
      ],
    });

    if (!user.subscriptions || user.subscriptions.length === 0) {
      req.existing_sub = false;
      req.valid_from = null;
    } else {
      console.log(user.subscriptions[user.subscriptions.length - 1].valid_to);
      req.existing_sub = true;
      req.valid_from = user.subscriptions[user.subscriptions.length - 1].valid_to;
    }

    await next();

  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function validateUserSubscription(req, res, next) {
  try {

    const token = verify(req);
    const { id } = req.params;
    const subscription = await Subscription.findByPk(id, { include: ["user", "plan"] });
    if (!subscription) return res.status(400).send(errorResponse({ message: "Invalid Subscription ID" }));
    if (subscription.user.id === token.id && subscription.purchaseType === "ONLINE") {
      req.body.subscription = subscription;
      await next();
    } else {
      return res.status(400).send(errorResponse({ message: "Invalid Request", details: "Token and Subsciption do not belongs to same user" }));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

