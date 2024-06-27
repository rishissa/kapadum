import { Router } from "express";
const router = Router();
import { create, find } from "../controllers/store_global_brand.js";
import { validateRequest } from "../middlewares/store_global_brand.js";
import RBAC from "../../../middlewares/RBAC.js";

const permissions = [
  {
    api: "store-global-brands",
    endpoint: "/api/store-global-brands",
    method: "POST",
    handler: "Create Store Global Brand",
  },
  {
    api: "store-global-brands",
    endpoint: "/api/store-global-brands",
    method: "GET",
    handler: "List Store Global Brands",
  },
];

export default (app) => {
  router.post("/", [RBAC, validateRequest], create);
  router.get("/", find);

  app.use("/api/store-global-brands", router);
};

const _permissions = permissions;
export { _permissions as permissions };
