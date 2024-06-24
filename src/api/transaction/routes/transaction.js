import { Router } from "express";
const router = Router();
import { create, userTransactions, exportToExcel, find, findOne, update, _delete } from "../controllers/transaction.js";
import { validateRequest } from "../middlewares/transaction.js";

const permissions = [
  {
    api: "transactions",
    endpoint: "/api/transactions",
    method: "POST",
    handler: "Create  Transaction",
  },
  {
    api: "transactions",
    endpoint: "/api/transactions",
    method: "GET",
    handler: "Find  Transactions",
  },
  {
    api: "transactions",
    endpoint: "/api/transactions/users",
    method: "GET",
    handler: "Find User's Transactions",
  },
  {
    api: "transactions",
    endpoint: "/api/transactions/export",
    method: "POST",
    handler: "Export Transactions To Excel",
  },
  {
    api: "transactions",
    endpoint: "/api/transactions/:id",
    method: "GET",
    handler: "Find One  Transaction",
  },
  {
    api: "transactions",
    endpoint: "/api/transactions/:id",
    method: "PUT",
    handler: "Update  Transaction",
  },
  {
    api: "transactions",
    endpoint: "/api/transactions/:id",
    method: "DELETE",
    handler: "Delete  Transaction",
  },
];

export default (app) => {
  router.post("/", [validateRequest], create);
  router.get("/users", userTransactions);
  router.post("/export", exportToExcel);
  router.get("/", find);
  router.get("/:id", findOne);
  router.put("/:id", update);
  router.delete("/:id", _delete);
  app.use("/api/transactions", router);
};

const _permissions = permissions;
export { _permissions as permissions };
