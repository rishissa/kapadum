import { Router } from "express";
const router = Router();

import { addToCart, consumerCart, emptyCart, deleteVariant } from "../controllers/cart.js";
import { validateAddToCart } from "../middlewares/cart.js";


const permissions = [
  {
    api: "cart",
    endpoint: "/api/cart/add",
    method: "POST",
    handler: "Add To Cart",
  },
  {
    api: "cart",
    endpoint: "/api/cart/me",
    method: "GET",
    handler: "List Consumer cart",
  },
  {
    api: "cart",
    endpoint: "/api/cart/empty",
    method: "DELETE",
    handler: "Empty cart",
  },
  {
    api: "cart",
    endpoint: "/api/cart/remove/:id",
    method: "DELETE",
    handler: "Remove Item From Cart",
  },
];

export default (app) => {

  router.post("/add", validateAddToCart, addToCart);
  router.get("/me", consumerCart);
  router.delete("/empty", emptyCart);
  router.delete("/remove/:id", deleteVariant);
  app.use("/api/cart", router);
};
const _permissions = permissions;
export { _permissions as permissions };
