import { Router } from "express";
const router = Router()
import { create, find, exportLeads, findOne, update, _delete, search, leadStats } from "../controllers/lead.js";
import { createLeadValidate, updateLeadValidate } from "../middlewares/lead.js";
import RBAC from "../../../middlewares/RBAC.js";
import { search as _search } from "../../../middlewares/queryValidator.js";

const permissions = [
  {
    api: "leads",
    endpoint: "/api/leads",
    method: "POST",
    handler: "Create  Lead",
  },
  {
    api: "leads",
    endpoint: "/api/leads",
    method: "GET",
    handler: "List  Leads",
  },
  {
    api: "leads",
    endpoint: "/api/leads/export",
    method: "POST",
    handler: "Export  Leads To Excel",
  },
  {
    api: "leads",
    endpoint: "/api/leads/:id",
    method: "GET",
    handler: "Get  Lead by ID",
  },
  {
    api: "leads",
    endpoint: "/api/leads/:id",
    method: "PUT",
    handler: "Update  Lead",
  },
  {
    api: "leads",
    endpoint: "/api/leads/:id",
    method: "DELETE",
    handler: "Delete  Lead",
  },
  {
    api: "leads",
    endpoint: "/api/leads/search",
    method: "GET",
    handler: "Search  Leads",
  },
];

export default (app) => {
  router.post("/", [createLeadValidate], create);
  router.get("/", [RBAC], find);
  router.get("/stats", leadStats);
  router.post("/export", exportLeads);
  router.get("/:id", [RBAC], findOne);
  router.put("/:id", [RBAC, updateLeadValidate], update);
  router.delete("/:id", [RBAC], _delete);
  router.get("/search", [RBAC, _search], search);
  app.use("/api/leads", router);
};

const _permissions = permissions;
export { _permissions as permissions };
