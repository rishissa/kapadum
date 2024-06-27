import { Router } from "express";
const router = Router();
import {
  create,
  find,
  findOne,
  getData,
  update,
  _delete,
  fetchResellerBanners,
  fetchResellerCategories,
  resellerOrder,
  fetchResellerProducts,
  searchResellers,
  redirectToAppReseller,
  fetchResellerOrders,
} from "../controllers/reseller.js";
// import {
//   addAccountDetails,
//   updateAccountDetails,
// } from "../middlewares/reseller.js";
import RBAC from "../../../middlewares/RBAC.js";
import {
  createUser,
  updateUser,
  validatelogin,
} from "../../user/middlewares/user.js";
import { validateResellerOrder } from "../../order/middlewares/order-validations.js";
import { validate_variant } from "../../order/middlewares/order.js";

const permissions = [
  //   {
  //     api: "resellers",
  //     endpoint: "/api/resellers/forget-password",
  //     method: "PUT",
  //     handler: "Forget Password",
  //   },
  //   {
  //     api: "resellers",
  //     endpoint: "/api/resellers/reset-password",
  //     method: "PUT",
  //     handler: "Reset Password",
  //   },
  {
    api: "resellers",
    endpoint: "/api/resellers/add",
    method: "POST",
    handler: "Create  User",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers/:id",
    method: "PUT",
    handler: "Update  User",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers",
    method: "GET",
    handler: "List  resellers",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers/me",
    method: "GET",
    handler: "Get Current  User",
  },
  //   {
  //     api: "resellers",
  //     endpoint: "/api/resellers/search",
  //     method: "GET",
  //     handler: "Search  resellers",
  //   },
  {
    api: "resellers",
    endpoint: "/api/resellers/:id",
    method: "GET",
    handler: "Find One  User",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers/:id",
    method: "DELETE",
    handler: "Delete  User",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers/login",
    method: "POST",
    handler: "Login",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers/:id/banners",
    method: "GET",
    handler: "List Reseller Banners",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers/:id/categories",
    method: "GET",
    handler: "List Reseller Categories",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers/orders",
    method: "POST",
    handler: "Place Reseller Order",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers/:id/products",
    method: "GET",
    handler: "Get Reseller Products",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers/search/:key",
    method: "GET",
    handler: "Search Resellers",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers/redirect/:key",
    method: "GET",
    handler: "Redirect to Reseller Store",
  },
  {
    api: "resellers",
    endpoint: "/api/resellers/orders",
    method: "GET",
    handler: "Get Reseller Orders",
  },
  //   {
  //     api: "resellers",
  //     endpoint: "/api/resellers/fcm/register",
  //     method: "POST",
  //     handler: "Register FCM",
  //   },
];

export default (app) => {
  router.post("/add", [createUser], create);
  router.post(
    "/orders",
    [RBAC, validateResellerOrder, validate_variant],
    resellerOrder
  );
  router.get("/orders", [RBAC], fetchResellerOrders);
  router.put("/:id", [RBAC, updateUser], update);
  router.get("/", [RBAC], find);
  router.get("/:id", [RBAC], findOne);
  router.delete("/:id", [RBAC], _delete);
  router.get("/:id/banners", fetchResellerBanners);
  router.get("/:id/categories", fetchResellerCategories);
  router.get("/:id/products", fetchResellerProducts);
  router.get("/search/:key", [RBAC], searchResellers);
  router.get("/redirect", redirectToAppReseller);

  //   router.post("/login", [validatelogin], login);
  app.use("/api/resellers", router);
};
const _permissions = permissions;
export { _permissions as permissions };
