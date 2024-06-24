import { Router } from "express";
const router = Router();
import {
  createCashfreeOrder,
  verifyCashfree,
  exportToExcel,
  find,
  create,
  searchOrders,
  findOne,
  update,
  checkOut,
  verify,
  webhook,
  checkOutWallet,
  resellerPayout,
  generateInvoice,
} from "../controllers/order.js";
import RBAC from "../../../middlewares/RBAC.js";
import {
  validateOrderBody,
  checkUserSubscription,
} from "../middlewares/order-validations.js";
import { validate_variant } from "../middlewares/order.js";

const permissions = [
  {
    api: "orders",
    endpoint: "/api/orders/checkout/cashfree",
    method: "POST",
    handler: "Create Cashfree Order",
  },

  {
    api: "orders",
    endpoint: "/api/orders/verify/cashfree",
    method: "GET",
    handler: "Verify Cashfree Order",
  },

  {
    api: "orders",
    endpoint: "/api/orders",
    method: "GET",
    handler: "List Orders",
  },
  {
    api: "orders",
    endpoint: "/api/orders",
    method: "POST",
    handler: "Create Order",
  },
  {
    api: "orders",
    endpoint: "/api/orders/search",
    method: "GET",
    handler: "Search Orders",
  },
  {
    api: "orders",
    endpoint: "/api/orders/:id",
    method: "GET",
    handler: "Find Order",
  },
  {
    api: "orders",
    endpoint: "/api/orders/:id",
    method: "PUT",
    handler: "Update Order",
  },
  {
    api: "orders",
    endpoint: "/api/orders/checkout/razorpay",
    method: "POST",
    handler: "Checkout Razorpay Order",
  },
  {
    api: "orders",
    endpoint: "/api/orders/verify/razorpay",
    method: "POST",
    handler: "Verify Razorpay Order",
  },
  {
    api: "orders",
    endpoint: "/api/orders/webhook/razorpay",
    method: "POST",
    handler: "Razorpay Webhook",
  },
  {
    api: "orders",
    endpoint: "/api/orders/checkout/wallet",
    method: "POST",
    handler: "Checkout Wallet Order",
  },
  {
    api: "orders",
    endpoint: "/api/orders/reseller/payout/:id",
    method: "GET",
    handler: "Reseller Payout",
  },
  {
    api: "orders",
    endpoint: "/api/orders/export",
    method: "POST",
    handler: "Export ORders",
  },
];

export default (app) => {
  router.post("/checkout/cashfree", [RBAC], createCashfreeOrder);
  router.get("/verify/cashfree", verifyCashfree);
  router.post("/export", exportToExcel);
  router.get("/", [], find);
  router.post("/", [RBAC], create);
  router.get("/search", searchOrders);
  router.get("/:id", [RBAC], findOne);
  router.put("/:id", [RBAC], update);
  router.get("/:id/invoice", [], generateInvoice);
  router.post(
    "/checkout/razorpay",
    [RBAC, validateOrderBody, validate_variant, checkUserSubscription],
    checkOut
  );
  router.post("/verify/razorpay", [RBAC], verify);
  router.post("/webhook/razorpay", webhook);
  router.post(
    "/checkout/wallet",
    [validateOrderBody, validate_variant, checkUserSubscription],
    checkOutWallet
  );
  router.get("/reseller/payout/:id", [RBAC], resellerPayout);
  app.use("/api/orders", router);
};

const _permissions = permissions;
export { _permissions as permissions };
