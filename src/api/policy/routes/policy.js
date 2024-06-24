import { Router } from "express";
const router = Router();
import { create, get } from "../controllers/policy.js";
import { createPolicy, updatePolicy } from "../middlewares/policy.js";

const permissions = [
  {
    api: "policy",
    endpoint: "/api/policy",
    method: "POST",
    handler: "Create  Policy",
  },
  {
    api: "policy",
    endpoint: "/api/policy",
    method: "GET",
    handler: "Get  Policy",
  },
];

export default (app) => {
  router.post("/", createPolicy, create);
  router.get("/", get);
  app.use("/api/policy", router);
};

const _permissions = permissions;
export { _permissions as permissions };
