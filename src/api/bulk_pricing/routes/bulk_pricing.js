import { Router } from "express";
const router = Router();
import { create, update, find, findOne, _delete } from "../controllers/bulk_pricing.js";
import { updateBulkPricing, createBulkPricing } from "../middlewares/bulk_pricing.js";



const permissions = [
  {
    api: "bulk-pricings",
    endpoint: "/api/bulk-pricings",
    method: "POST",
    handler: "Create bulk-pricings",
  },
  {
    api: "bulk-pricings",
    endpoint: "/api/bulk-pricings",
    method: "GET",
    handler: "List bulk-pricings",
  },
  {
    api: "bulk-pricings",
    endpoint: "/api/bulk-pricings/:id",
    method: "GET",
    handler: "List Single bulk-pricings",
  },
  {
    api: "bulk-pricings",
    endpoint: "/api/bulk-pricings/:id",
    method: "PUT",
    handler: "Update bulk-pricings",
  },
  {
    api: "bulk-pricings",
    endpoint: "/api/bulk-pricings/:id",
    method: "DELETE",
    handler: "Delete bulk-pricings",
  },
];

router.post("/", createBulkPricing, create);
router.put("/:id", updateBulkPricing, update);
router.get("/", find);
router.get("/:id", findOne);
router.delete("/:id", _delete);

export default (app) => {
  app.use("/api/bulk-pricings", router);
};
const _permissions = permissions;
export { _permissions as permissions };
