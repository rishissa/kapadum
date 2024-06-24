import { Router } from "express";
const router = Router()
import { create, find, findOne, update, _delete, getProducts } from "../controllers/collection_static.js";
import { validateCreateRequest, validateUpdateRequest } from "../middlewares/collection_static.js";

const permissions = [
  {
    api: "collection-static",
    endpoint: "/api/collection-static",
    method: "POST",
    handler: "Create collection-static",
  },
  {
    api: "collection-static",
    endpoint: "/api/collection-static",
    method: "GET",
    handler: "List collection-static",
  },
  {
    api: "collection-static",
    endpoint: "/api/collection-static/:id",
    method: "GET",
    handler: "List Single collection-static",
  },
  {
    api: "collection-static",
    endpoint: "/api/collection-static/:id",
    method: "PUT",
    handler: "Update collection-static",
  },
  {
    api: "collection-static",
    endpoint: "/api/collection-static/:id",
    method: "DELETE",
    handler: "Delete collection-static",
  },
  {
    api: "collection-static",
    endpoint: "/api/collection-static/:id/products",
    method: "GET",
    handler: "List collection-static's products",
  },

];

export default (app) => {
  router.post("/", validateCreateRequest, create);
  router.get("/", find);
  router.get("/:id", findOne);
  router.put("/:id", validateUpdateRequest, update);
  router.delete("/:id", _delete);
  router.get("/:id/products", getProducts);

  app.use("/api/collection-static", router);
};
const _permissions = permissions;
export { _permissions as permissions };