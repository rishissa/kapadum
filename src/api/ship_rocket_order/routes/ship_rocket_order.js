import { Router } from "express";
const router = Router()
import RBAC from "../../../middlewares/RBAC.js";
import { create, _delete as destroy, find, findOne, pickupAddresses, productReturn, update, webhook } from "../controllers/ship_rocket_order.js";
import { validateShipRocketOrder, validateShipRocketReturn } from "../middlewares/ship_rocket_order.js";

const permissions = [
  {
    api: "ship-rocket-orders",
    endpoint: "/api/ship-rocket-orders",
    method: "POST",
    handler: "Create Ship Rocket Order",
  },
  {
    api: "ship-rocket-orders",
    endpoint: "/api/ship-rocket-orders/return",
    method: "POST",
    handler: "Create Ship Rocket Return",
  },
  {
    api: "ship-rocket-orders",
    endpoint: "/api/ship-rocket-orders/webhook",
    method: "POST",
    handler: "Ship Rocket Webhook",
  },
  {
    api: "ship-rocket-orders",
    endpoint: "/api/ship-rocket-orders",
    method: "GET",
    handler: "List Ship Rocket Orders",
  },
  {
    api: "ship-rocket-orders",
    endpoint: "/api/ship-rocket-orders/:id",
    method: "GET",
    handler: "Get Ship Rocket Order by ID",
  },
  {
    api: "ship-rocket-orders",
    endpoint: "/api/ship-rocket-orders/:id",
    method: "PUT",
    handler: "Update Ship Rocket Order",
  },
  {
    api: "ship-rocket-orders",
    endpoint: "/api/ship-rocket-orders/:id",
    method: "DELETE",
    handler: "Delete Ship Rocket Order",
  },
  {
    api: "ship-rocket-orders",
    endpoint: "/api/ship-rocket-orders/address",
    method: "GET",
    handler: "Get Ship Rocket Address",
  },
];

export default (app) => {
  router.post("/", [RBAC], validateShipRocketOrder, create);
  router.get("/address", pickupAddresses);
  router.post("/return", [RBAC], validateShipRocketReturn, productReturn);
  router.post("/webhook", [RBAC], webhook);
  router.get("/", [RBAC], find);
  router.get("/:id", [RBAC], findOne);
  router.put("/:id", [RBAC], validateShipRocketOrder, update);
  router.delete("/:id", [RBAC], destroy);

  app.use("/api/ship-rocket-orders", router);
};

const _permissions = permissions;
export { _permissions as permissions };
