// src/api/post/postRoutes.js
import { Router } from "express";
const router = Router();
import RBAC from "../../../middlewares/RBAC.js";
import {
  create,
  find,
  findOne,
  update,
  destroy,
} from "../controllers/reseller_banner.js";
import { validateRequest } from "../middlewares/reseller_banner.js";

// Define routes for the "Post" resource

const permissions = [
  {
    api: "reseller-banners",
    endpoint: "/api/reseller-banners/add",
    method: "POST",
    handler: "Create Reseller Banner",
  },
  {
    api: "reseller-banners",
    endpoint: "/api/reseller-banners/:id",
    method: "GET",
    handler: "List Single ResellerBanners",
  },
  {
    api: "reseller-banners",
    endpoint: "/api/reseller-banners/:id",
    method: "PUT",
    handler: "Update ResellerBanners",
  },
  {
    api: "reseller-banners",
    endpoint: "/api/reseller-banners/:id",
    method: "DELETE",
    handler: "Delete ResellerBanners",
  },
];
export default (app) => {
  router.post("/add", [RBAC, validateRequest], create);
  router.get("/:id", findOne);
  router.put("/:id", update);
  router.delete("/:id", destroy);
  app.use("/api/reseller-banners", router);
};
const _permissions = permissions;
export { _permissions as permissions };
