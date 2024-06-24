import { Router } from "express";
const router = Router();
import {
  create,
  userAccountDetails,
  search,
  find,
  findOne,
  update,
  _delete,
} from "../controllers/account-detail.js";
import {
  addAccountDetails,
  updateAccountDetails,
} from "../middlewares/account-detail.js";
import RBAC from "../../../middlewares/RBAC.js";

const permissions = [
  {
    api: "account-details",
    endpoint: "/api/account-details",
    method: "POST",
    handler: "Create account-details",
  },
  {
    api: "account-details",
    endpoint: "/api/account-details/user",
    method: "GET",
    handler: "List User's account-details",
  },
  {
    api: "account-details",
    endpoint: "/api/account-details/search",
    method: "GET",
    handler: "Search account-details",
  },
  {
    api: "account-details",
    endpoint: "/api/account-details",
    method: "GET",
    handler: "List All account-details",
  },
  {
    api: "account-details",
    endpoint: "/api/account-details/:id",
    method: "GET",
    handler: "List Single account-details",
  },
  {
    api: "account-details",
    endpoint: "/api/account-details/:id",
    method: "PUT",
    handler: "Update account-details",
  },
  {
    api: "account-details",
    endpoint: "/api/account-details/:id",
    method: "DELETE",
    handler: "Delete account-details",
  },
];

export default (app) => {
  router.post("/", [RBAC], addAccountDetails, create);
  router.get("/user", [RBAC], userAccountDetails);
  router.get("/search", search);
  router.get("/", find);
  router.get("/:id", findOne);
  router.put("/:id", updateAccountDetails, update);
  router.delete("/:id", [RBAC], _delete);
  app.use("/api/account-details", router);
};
const _permissions = permissions;
export { _permissions as permissions };
