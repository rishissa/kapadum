import { Router } from "express";
const router = Router();
import { create, userAddress, search, find, findOne, update, _delete } from "../controllers/address.js";
import { addAddress, updateAddress } from "../middlewares/address.js";

const permissions = [
  {
    api: "address",
    endpoint: "/api/address",
    method: "POST",
    handler: "Create Address",
  },
  {
    api: "address",
    endpoint: "/api/address/user-address",
    method: "GET",
    handler: "List User's Address",
  },
  {
    api: "address",
    endpoint: "/api/address/search",
    method: "GET",
    handler: "Search Address",
  },
  {
    api: "address",
    endpoint: "/api/address",
    method: "GET",
    handler: "List All Address",
  },
  {
    api: "address",
    endpoint: "/api/address/:id",
    method: "GET",
    handler: "List Single Address",
  },
  {
    api: "address",
    endpoint: "/api/address/:id",
    method: "PUT",
    handler: "Update Address",
  },
  {
    api: "address",
    endpoint: "/api/address/:id",
    method: "DELETE",
    handler: "Delete Address",
  },
];

export default (app) => {
  router.post("/", addAddress, create);
  router.get("/user-address", userAddress);
  router.get("/search", search);
  router.get("/", find);
  router.get("/:id", findOne);
  router.put("/:id", updateAddress, update);
  router.delete("/:id", _delete);
  app.use("/api/address", router);
};
const _permissions = permissions;
export { _permissions as permissions };
