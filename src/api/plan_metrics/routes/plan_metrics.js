import { Router } from "express";

import { create, find, findOne, update, _delete } from "../controllers/plan_metrics.js";
import RBAC from "../../../middlewares/RBAC.js";
const router = Router()

const permissions = [
  {
    api: "plan-metrics",
    endpoint: "/api/plan-metrics",
    method: "POST",
    handler: "Create  Plan Metrics",
  },
  {
    api: "plan-metrics",
    endpoint: "/api/plan-metrics",
    method: "GET",
    handler: "List  Plan Metrics",
  },
  {
    api: "plan-metrics",
    endpoint: "/api/plan-metrics/:id",
    method: "GET",
    handler: "Get  Plan Metrics by ID",
  },
  {
    api: "plan-metrics",
    endpoint: "/api/plan-metrics/:id",
    method: "PUT",
    handler: "Update  Plan Metrics",
  },
  {
    api: "plan-metrics",
    endpoint: "/api/plan-metrics/:id",
    method: "DELETE",
    handler: "Delete  Plan Metrics",
  },
];

export default (app) => {
  router.post("/", [RBAC], create);
  router.get("/", [RBAC], find);
  router.get("/:id", [RBAC], findOne);
  router.put("/:id", [RBAC], update);
  router.delete("/:id", [RBAC], _delete);

  app.use("/api/plan-metrics", router);
};

const _permissions = permissions;
export { _permissions as permissions };
