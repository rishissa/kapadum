import { Router } from "express";
const router = Router();
import { create, find, findOne, update, _delete } from "../controllers/tenant_metric.js";
import { validateRequest } from "../middlewares/tenant_metric.js"; // Import your validation middleware here

const permissions = [
  {
    api: "tenant-metrics",
    endpoint: "/api/tenant-metrics",
    method: "POST",
    handler: "Create Tenant Metric",
  },
  {
    api: "tenant-metrics",
    endpoint: "/api/tenant-metrics",
    method: "GET",
    handler: "List Tenant Metrics",
  },
  {
    api: "tenant-metrics",
    endpoint: "/api/tenant-metrics/:id",
    method: "GET",
    handler: "Find One Tenant Metric",
  },
  {
    api: "tenant-metrics",
    endpoint: "/api/tenant-metrics/:id",
    method: "PUT",
    handler: "Update Tenant Metric",
  },
  {
    api: "tenant-metrics",
    endpoint: "/api/tenant-metrics/:id",
    method: "DELETE",
    handler: "Delete Tenant Metric",
  },
];

export default (app) => {
  router.post("/", validateRequest, create);
  router.get("/", find);
  router.get("/:id", findOne);
  router.put("/:id", validateRequest, update);
  router.delete("/:id", _delete);

  // You can pass the permissions array along with the router
  app.use("/api/tenant-metrics", router);
};

const _permissions = permissions;
export { _permissions as permissions };
