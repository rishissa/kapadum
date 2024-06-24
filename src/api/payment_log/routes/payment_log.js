import { Router } from "express";
const router = Router()
import RBAC from "../../../middlewares/RBAC.js";
import { create, exportToExcel, find, findOne, update, _delete } from "../controllers/payment_log.js";

const permissions = [
  {
    api: "payment-log",
    endpoint: "/api/payment-log",
    method: "POST",
    handler: "Create  Payment Log",
  },
  {
    api: "payment-log",
    endpoint: "/api/payment-log",
    method: "GET",
    handler: "List  Payment Logs",
  },
  {
    api: "payment-log",
    endpoint: "/api/payment-log/:id",
    method: "GET",
    handler: "Get  Payment Log by ID",
  },
  {
    api: "payment-log",
    endpoint: "/api/payment-log/:id",
    method: "PUT",
    handler: "Update  Payment Log",
  },
  {
    api: "payment-log",
    endpoint: "/api/payment-log/:id",
    method: "DELETE",
    handler: "Delete  Payment Log",
  },
  {
    api: "payment-log",
    endpoint: "/api/payment-log/export",
    method: "POST",
    handler: "Export Payment Log",
  },
];

export default (app) => {
  router.post("/", [RBAC], create);
  router.post("/export", [], exportToExcel);
  router.get("/", [RBAC], find);
  router.get("/:id", [RBAC], findOne);
  router.put("/:id", [RBAC], update);
  router.delete("/:id", [RBAC], _delete);
  app.use("/api/payment-log", router);
};

const _permissions = permissions;
export { _permissions as permissions };
