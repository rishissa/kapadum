import { Router } from "express";
const router = Router()
import { create, find } from "../controllers/free_plan.js";
import { validateFreePlan } from "../middlewares/free_plan.js";

const permissions = [
  {
    api: "free-plan",
    endpoint: "/api/free-plans",
    method: "POST",
    handler: "Create Free Plan",
  },
  {
    api: "free-plan",
    endpoint: "/api/free-plans",
    method: "GET",
    handler: "List free-plans",
  },
];

export default (app) => {
  router.post("/", [validateFreePlan], create);
  router.get("/", find);
  app.use("/api/free-plans", router);
};
const _permissions = permissions;
export { _permissions as permissions };
