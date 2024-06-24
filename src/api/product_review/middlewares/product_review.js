

import Joi from "joi";


export async function validateRequest(req, res, next) {

    function validate(body) {
        const JoiSchema = Joi.object({
            "rating": Joi.number().required(),
            "ProductId": Joi.number().required(),
            "review": Joi.string().optional().min(1).max(5),
            "gallery": Joi.array().items(number()).optional()
        });

        return JoiSchema.validate(body);
    }

    let result = validate(req.body);
    if (result.error) {
        return res.status(400).send(errorResponse({
            message: result.error.message,
            details: result.error.details
        }));
    }
    await next(); // Corrected the square brackets to curly braces
}
