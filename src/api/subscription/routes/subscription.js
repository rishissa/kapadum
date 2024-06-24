import { Router } from "express";
const router = Router();
import RBAC from "../../../middlewares/RBAC.js";
import { create, find, serverFeeSubscription, CFVerify, usersSubsctions, findOne, update, _delete, checkOut, verify, SF_checkOut, SF_verify, webhook, refund, generateInvoice, generateServerInvoice } from "../controllers/subscription.js";
import { validateRequest, checkPlan, checkExistingSubscription, validateUserSubscription } from "../middlewares/subscription.js";

const permissions = [
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions",
    method: "POST",
    handler: "Create  Subscription",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions",
    method: "GET",
    handler: "Find  Subscriptions",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions/server-fee",
    method: "GET",
    handler: "Server Fee Subscription",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions/cf-verify",
    method: "GET",
    handler: "CF Verify Subscription",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions/:id",
    method: "GET",
    handler: "Find One  Subscription",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions/:id",
    method: "PUT",
    handler: "Update  Subscription",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions/:id",
    method: "DELETE",
    handler: "Delete  Subscription",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions/checkout",
    method: "POST",
    handler: "Check Out Subscription",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions/verify",
    method: "POST",
    handler: "Verify Subscription",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions/server-fee/checkout",
    method: "POST",
    handler: "Server Fee Check Out Subscription",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions/server-fee/verify",
    method: "POST",
    handler: "Server Fee Verify Subscription",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions/webhooks",
    method: "POST",
    handler: "Webhook Subscription",
  },
  {
    api: "subscriptions",
    endpoint: "/api/subscriptions/:id/cancel",
    method: "PUT",
    handler: "Refund Subscription",
  },
];

export default (app) => {
  router.post("/", [RBAC, validateRequest], create);
  router.get("/", [RBAC], find);
  router.get("/:id/invoice", [], generateInvoice);
  router.get("/server-fee", [RBAC], serverFeeSubscription);
  router.get("/server-fee/:id/invoice", [], generateServerInvoice);
  router.post("/server-fee/verify", SF_verify);
  router.get("/cf-verify", CFVerify);
  router.get("/users", [RBAC], usersSubsctions);
  router.get("/:id", [RBAC], findOne);
  router.put("/:id", [RBAC, validateRequest], update);
  router.delete("/:id", [RBAC], _delete);
  router.post("/checkout", [checkPlan, checkExistingSubscription], checkOut);
  router.post("/verify", verify);
  router.post("/server-fee/checkout", [RBAC], SF_checkOut);
  router.post("/webhooks", webhook);
  router.put("/:id/cancel", validateUserSubscription, refund);
  app.use("/api/subscriptions", router);
};

const _permissions = permissions;
export { _permissions as permissions };
