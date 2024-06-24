import { Router } from "express";
const router = Router();
import { create, find, search, findOne, update, _delete } from "../controllers/tag.js";
import RBAC from "../../../middlewares/RBAC.js";
import { validateRequest } from "../middlewares/tag.js";

const permissions = [
  {
    api: "tags",
    endpoint: "/api/tags",
    method: "POST",
    handler: "Create Tag",
  },
  {
    api: "tags",
    endpoint: "/api/tags",
    method: "GET",
    handler: "List Tags",
  },
  {
    api: "tags",
    endpoint: "/api/tags/search",
    method: "GET",
    handler: "Search Tags",
  },
  {
    api: "tags",
    endpoint: "/api/tags/:id",
    method: "GET",
    handler: "Find One Tag",
  },
  {
    api: "tags",
    endpoint: "/api/tags/:id",
    method: "PUT",
    handler: "Update Tag",
  },
  {
    api: "tags",
    endpoint: "/api/tags/:id",
    method: "DELETE",
    handler: "Delete Tag",
  },
];

export default (app) => {
  router.post("/", [RBAC, validateRequest], create);
  router.get("/", find);
  router.get("/search", search);
  router.get("/:id", findOne);
  router.put("/:id", [RBAC], update);
  router.delete("/:id", _delete);
  app.use("/api/tags", router);
};

const _permissions = permissions;
export { _permissions as permissions };
