import { Router } from "express";
const router = Router()
import RBAC from "../../../middlewares/RBAC.js";
import { create, find, findOne, update, _delete } from "../controllers/plan.js";
import { validateCreateRequest, validateUpdateRequest } from "../middlewares/plan.js";

const permissions = [
  {
    api: "plans",
    endpoint: "/api/plans",
    method: "POST",
    handler: "Create  Plan",
  },
  {
    api: "plans",
    endpoint: "/api/plans",
    method: "GET",
    handler: "List  Plans",
  },
  {
    api: "plans",
    endpoint: "/api/plans/:id",
    method: "GET",
    handler: "Get  Plan by ID",
  },
  {
    api: "plans",
    endpoint: "/api/plans/:id",
    method: "PUT",
    handler: "Update  Plan",
  },
  {
    api: "plans",
    endpoint: "/api/plans/:id",
    method: "DELETE",
    handler: "Delete  Plan",
  },
];

export default (app) => {
  router.post("/", [RBAC, validateCreateRequest], create);
  router.get("/", [], find);
  router.get("/:id", [], findOne);
  router.put("/:id", [RBAC, validateUpdateRequest], update);
  router.delete("/:id", [RBAC], _delete);
  app.use("/api/plans", router);
};

const _permissions = permissions;
export { _permissions as permissions };
