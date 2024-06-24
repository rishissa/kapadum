import { Router } from "express";
const router = Router();
import { create, find, findOne, update, _delete } from "../controllers/notification.js";
import { validateRequest } from "../middlewares/notification.js";

const permissions = [
  {
    api: "notifications",
    endpoint: "/api/notifications",
    method: "POST",
    handler: "Create Notification",
  },
  {
    api: "notifications",
    endpoint: "/api/notifications",
    method: "GET",
    handler: "List Notifications",
  },
  {
    api: "notifications",
    endpoint: "/api/notifications/:id",
    method: "GET",
    handler: "Find Notification",
  },
  {
    api: "notifications",
    endpoint: "/api/notifications/:id",
    method: "PUT",
    handler: "Update Notification",
  },
  {
    api: "notifications",
    endpoint: "/api/notifications/:id",
    method: "DELETE",
    handler: "Delete Notification",
  },
];

export default (app) => {
  router.post("/", validateRequest, create);
  router.get("/", find);
  router.get("/:id", findOne);
  router.put("/:id", validateRequest, update);
  router.delete("/:id", _delete);
  app.use("/api/notifications", router);
};

const _permissions = permissions;
export { _permissions as permissions };
