import { Router } from "express";
const router = Router();
import RBAC from "../../../middlewares/RBAC.js";
import { create, update, find, findOne, _delete, findByCategory } from "../controllers/sub_category.js";
import { validateCreateRequest, validateUpdateRequest } from "../middlewares/sub_category.js";

const permissions = [
  {
    api: "sub-categories",
    endpoint: "/api/sub-categories",
    method: "POST",
    handler: "Create Sub-Category",
  },
  {
    api: "sub-categories",
    endpoint: "/api/sub-categories/:id",
    method: "PUT",
    handler: "Update Sub-Category",
  },
  {
    api: "sub-categories",
    endpoint: "/api/sub-categories",
    method: "GET",
    handler: "Get Sub-Categories",
  },
  {
    api: "sub-categories",
    endpoint: "/api/sub-categories/:id",
    method: "GET",
    handler: "Get Sub-Category by ID",
  },
  {
    api: "sub-categories",
    endpoint: "/api/sub-categories/:id",
    method: "DELETE",
    handler: "Remove Sub-Category",
  },
  {
    api: "sub-categories",
    endpoint: "/api/sub-categories/category/:id",
    method: "GET",
    handler: "Get Sub-Category Within a Category",
  },
];

export default (app) => {
  router.post("/", [RBAC, validateCreateRequest], create);
  router.put("/:id", [RBAC, validateUpdateRequest], update);
  router.get("/", [], find);
  router.get("/:id", [], findOne);
  router.get("/category/:id", [], findByCategory);
  router.delete("/:id", [RBAC], _delete);
  app.use("/api/sub-categories", router);
};

const _permissions = permissions;
export { _permissions as permissions };
