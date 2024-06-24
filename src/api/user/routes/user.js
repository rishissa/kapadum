import { Router } from "express";
const router = Router();
import { forgetPassword as _forgetPassword, resetPassword as _resetPassword, create, update, find, getMe, search, dashboard, findOne, _delete, login, register_FCM, sendLoginOTP, verifyLoginOTP } from "../controllers/user.js";
import { createUser, updateUser, FCM_registration, validatelogin, forgetPassword, resetPassword, validateSendloginOTP, validateVerifyloginOTP } from "../middlewares/user.js";
import RBCA from "../../../middlewares/RBAC.js";

const permissions = [
  {
    api: "users",
    endpoint: "/api/users/forget-password",
    method: "PUT",
    handler: "Forget Password",
  },
  {
    api: "users",
    endpoint: "/api/users/reset-password",
    method: "PUT",
    handler: "Reset Password",
  },
  {
    api: "users",
    endpoint: "/api/users",
    method: "POST",
    handler: "Create  User",
  },
  {
    api: "users",
    endpoint: "/api/users/:id",
    method: "PUT",
    handler: "Update  User",
  },
  {
    api: "users",
    endpoint: "/api/users",
    method: "GET",
    handler: "List  Users",
  },
  {
    api: "users",
    endpoint: "/api/users/me",
    method: "GET",
    handler: "Get Current  User",
  },
  {
    api: "users",
    endpoint: "/api/users/search",
    method: "GET",
    handler: "Search  Users",
  },
  {
    api: "users",
    endpoint: "/api/users/:id",
    method: "GET",
    handler: "Find One  User",
  },
  {
    api: "users",
    endpoint: "/api/users/:id",
    method: "DELETE",
    handler: "Delete  User",
  },
  {
    api: "users",
    endpoint: "/api/users/login",
    method: "POST",
    handler: "Login",
  },
  {
    api: "users",
    endpoint: "/api/users/fcm/register",
    method: "POST",
    handler: "Register FCM",
  },
];

export default (app) => {
  router.put("/forget-password", [forgetPassword], _forgetPassword);
  router.put("/reset-password", [resetPassword], _resetPassword);
  router.post("/", [createUser], create);
  router.put("/:id", [RBCA, updateUser], update);
  router.get("/", [RBCA], find);
  router.get("/me", getMe);
  router.get("/search", [RBCA], search);
  router.get("/dashbaord", dashboard);
  router.get("/:id", [RBCA], findOne);
  router.delete("/:id", [RBCA], _delete);
  router.post("/login", [validatelogin], login);
  router.post("/send-otp", [validateSendloginOTP], sendLoginOTP);
  router.post("/verify-otp", [validateVerifyloginOTP], verifyLoginOTP);
  router.post("/fcm/register", [FCM_registration], register_FCM);
  app.use("/api/users", router);
};

// Exporting the permissions array separately
const _permissions = permissions;
export { _permissions as permissions };
