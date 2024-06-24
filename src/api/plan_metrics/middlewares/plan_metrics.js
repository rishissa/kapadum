import { object, string, number, boolean } from "joi";
import { errorResponse } from "../../../services/errorResponse.js";

export async function validateCreateRequest(req, res, next) {
    function validate(body) {
        const JoiSchema = object({
            "name": string().required(),
            "validity": number().positive().required(),
            "price": number().positive().required(),
            "description": string().required(),
        });
        return JoiSchema.validate(body);
    }
    let result = validate(req.body);
    if (result.error) return res.status(400).send(errorResponse({ message: result.error.message, details: result.error.details }));
    else await next();

}
export async function validateUpdateRequest(req, res, next) {
    function validate(body) {
        const JoiSchema = object({
            "name": string().optional(),
            "validity": number().positive().optional(),
            "price": number().positive().optional(),
            "description": string().optional(),
            "is_active": boolean().optional()
        });
        return JoiSchema.validate(body);
    }
    let result = validate(req.body);
    if (result.error) return res.status(400).send(errorResponse({ message: result.error.message, details: result.error.details }));
    else await next();
}
