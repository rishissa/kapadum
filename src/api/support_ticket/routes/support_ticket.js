import { Router } from "express";
const router = Router();
import { create, userTickets, exportToExcel, userSingleTicket, find, findOne, update, changeStatus, _delete } from "../controllers/support_ticket.js";
import { validateRequest, validateUpdateRequest } from "../middlewares/support_ticket.js";

const permissions = [
  {
    api: "support-tickets",
    endpoint: "/api/support-tickets",
    method: "POST",
    handler: "Create  Support Ticket",
  },
  {
    api: "support-tickets",
    endpoint: "/api/support-tickets/user",
    method: "GET",
    handler: "User Tickets",
  },
  {
    api: "support-tickets",
    endpoint: "/api/support-tickets/user/:id",
    method: "GET",
    handler: "User Single Ticket",
  },
  {
    api: "support-tickets",
    endpoint: "/api/support-tickets",
    method: "GET",
    handler: "Find  Support Tickets",
  },
  {
    api: "support-tickets",
    endpoint: "/api/support-tickets/:id",
    method: "GET",
    handler: "Find One  Support Ticket",
  },
  {
    api: "support-tickets",
    endpoint: "/api/support-tickets/:id",
    method: "PUT",
    handler: "Update  Support Ticket",
  },
  {
    api: "support-tickets",
    endpoint: "/api/support-tickets/:id/:status",
    method: "PUT",
    handler: "Change Status of  Support Ticket",
  },
  {
    api: "support-tickets",
    endpoint: "/api/support-tickets/:id",
    method: "DELETE",
    handler: "Delete  Support Ticket",
  },
  {
    api: "support-tickets",
    endpoint: "/api/support-tickets/export",
    method: "GET",
    handler: "Export  Support Ticket To excel",
  },
];

export default (app) => {
  router.post("/", [validateRequest], create);
  router.get("/user", userTickets);
  router.get("/export", exportToExcel);
  router.get("/user/:id", userSingleTicket);
  router.get("/", find);
  router.get("/:id", findOne);
  router.put("/:id", [validateUpdateRequest], update);
  router.put("/:id/:status", changeStatus);
  router.delete("/:id", _delete);
  app.use("/api/support-tickets", router);
};

const _permissions = permissions;
export { _permissions as permissions };
