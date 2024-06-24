// src/api/post/postRoutes.js
import { Router } from "express";
const router = Router();
import RBAC from "../../../middlewares/RBAC.js";
import { search } from "../../../middlewares/queryValidator.js";
import {
  create,
  find,
  findOne,
  update,
  _delete,
  getProducts,
  searchInCategory,
} from "../controllers/reseller_category.js";
import {
  validateCreateRequest,
  validateUpdateRequest,
} from "../middlewares/reseller_category.js";

// Define routes for the "Post" resource

const permissions = [
  {
    api: "reseller-category",
    endpoint: "/api/reseller-categories",
    method: "POST",
    handler: "Create Reseller Category",
  },
  {
    api: "reseller-category",
    endpoint: "/api/reseller-categories",
    method: "GET",
    handler: "List Categories",
  },
  {
    api: "reseller-category",
    endpoint: "/api/reseller-categories/:id",
    method: "GET",
    handler: "List Single Reseller Category",
  },
  {
    api: "reseller-category",
    endpoint: "/api/reseller-categories/:id",
    method: "PUT",
    handler: "Update Reseller Category",
  },
  {
    api: "reseller-category",
    endpoint: "/api/reseller-categories/:id",
    method: "DELETE",
    handler: "Delete Reseller Category",
  },
  {
    api: "reseller-category",
    endpoint: "/api/reseller-categories/:id/products",
    method: "GET",
    handler: "List Reseller Category's products",
  },
  {
    api: "reseller-category",
    endpoint: "/api/reseller-categories/:id/products/search",
    method: "GET",
    handler: "Search Reseller Category's products",
  },
];

export default (app) => {
  router.post("/", [RBAC, validateCreateRequest], create);
  router.get("/", find);
  router.get("/:id", findOne);
  router.put("/:id", [RBAC, validateUpdateRequest], update);
  router.delete("/:id", [RBAC], _delete);
  router.get("/:id/products", getProducts);
  router.get("/:id/products/search", [search], searchInCategory);
  app.use("/api/reseller-categories", router);
};
const _permissions = permissions;
export { _permissions as permissions };
