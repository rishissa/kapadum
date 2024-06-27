import { Router } from "express";
const router = Router();
import RBAC from "../../../middlewares/RBAC.js";
import { create, find } from "../controllers/store_global.js";
import { validateRequest } from "../middlewares/store_global.js";

const permissions = [
  {
    api: "store-globals",
    endpoint: "/api/store-globals",
    method: "POST",
    handler: "Create Store Global",
  },
  {
    api: "store-globals",
    endpoint: "/api/store-globals",
    method: "GET",
    handler: "List Store Globals",
  },
];

export default (app) => {
  router.post("/", [RBAC, validateRequest], create);
  router.get("/", [RBAC, validateRequest], find);
  app.use("/api/store-globals", router);
};

const _permissions = permissions;
export { _permissions as permissions };
