import Joi from "joi";

import { verify } from "../../../services/jwt.js";
import { payment_modes } from "../../../constants/order.js";
import { errorResponse } from "../../../services/errorResponse.js";
import User from "./../../user/models/user.js";
import Subscription from "./../../subscription/models/subscription.js";

export async function validateOrderBody(req, res, next) {
  try {
    console.log("inside validate order body");
    const token = verify(req);

    const user = await User.findByPk(token.id, {
      include: [
        "role",
        {
          model: Subscription,
          as: "subscriptions",
          include: ["plan"],
        },
      ],
    });

    const role = user.role.name;
    // Define the base schema for the object
    const baseSchema = Joi.object({
      consumer: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().email().required(),
        isResellerOrder: Joi.boolean().optional(),
      }).optional(),
      payment_mode: Joi.string()
        .valid(...Object.values(payment_modes))
        .required(),
      variants: Joi.array()
        .items(
          Joi.object({
            VariantId: Joi.number().required(),
            quantity: Joi.number().required(),
            sellingPrice: Joi.number().optional().allow(null, ""),
            note: Joi.string().optional().allow("", null),
          })
        )
        .required(),
      AddressId: Joi.number().required(),
      UserId: Joi.number().optional(),
    });

    for (const [i, v] of req.body.variants.entries()) {
      if (req.body.consumer.isResellerOrder && !v.sellingPrice) {
        return res
          .status(400)
          .send(errorResponse({ message: `variants[${i}].sellingPrice` }));
      }
    }

    // Create a schema based on the role
    const schema =
      role === "Admin"
        ? baseSchema.keys({ UserId: Joi.number().required() })
        : baseSchema;
    const result = schema.validate(req.body);
    if (!result.error) {
      req.user = user;
      return next();
    }
    return res.status(400).send(
      errorResponse({
        message: result.error.message,
        details: result.error.details,
      })
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
}

export async function checkUserSubscription(req, res, next) {
  try {
    console.log("Inside Check User Subscription");
    const user = req.user;
    const user_subs = user.subscriptions;

    if (user_subs.length > 0) {
      //loop thru subs and check the recent subs
      //and check if that sub is xpired
      const recentSub = user_subs.reduce((acc, curr) => {
        return curr.id > acc.id ? curr : acc;
      });

      if (new Date(recentSub.valid_to) > new Date()) {
        //check if payment_mode & cod_allowed is COD and true.
        let payment_mode = req.body.payment_mode;

        if (
          payment_mode === payment_modes.cod &&
          recentSub.plan.cod_allowed === false
        ) {
          return res.send(
            errorResponse({
              message: "COD is not allowed in your current plan",
            })
          );
        }
        req.user_sub = recentSub;
        console.log("Subscription Not expired");
      } else {
        req.user_sub = recentSub;
        console.log("Subscription expired");
      }
      // console.log(recentSub);
      // req.user_sub = user_subs;
      return next();
    } else {
      console.log("No Subscriptions");
      return next();
    }
  } catch (err) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
}

export async function validateResellerOrder(req, res, next) {
  try {
    const user = res.user;
    const baseSchema = Joi.object({
      consumer: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().email().required(),
        isResellerOrder: Joi.boolean().optional(),
      }).optional(),
      // payment_mode: Joi.string()
      //   .valid(...Object.values(payment_modes))
      //   .required(),
      variants: Joi.array()
        .items(
          Joi.object({
            VariantId: Joi.number().required(),
            quantity: Joi.number().required(),
            sellingPrice: Joi.number().optional().allow(null, ""),
            note: Joi.string().optional().allow("", null),
          })
        )
        .required(),
      AddressId: Joi.number().required(),
      UserId: Joi.number().optional(),
    });
    
    for (const [i, v] of req.body.variants.entries()) {
      if (req.body.consumer.isResellerOrder && !v.sellingPrice) {
        return res
          .status(400)
          .send(errorResponse({ message: `variants[${i}].sellingPrice` }));
      }
    }

    const result = baseSchema.validate(req.body);
    if (!result.error) {
      req.user = user;
      return next();
    }
    return res.status(400).send(
      errorResponse({
        message: result.error.message,
        details: result.error.details,
      })
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
}
