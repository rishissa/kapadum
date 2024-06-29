import { Router } from "express";
const router = Router();
import {
  create,
  update,
  find,
  findOne,
  _delete,
  getProductsByCollection,
  searchProductsInCollection,
} from "../controllers/reseller_collection.js";
import {
  validateCreateCollection,
  validateUpdateCollection,
} from "../middlewares/reseller_collection.js";
import RABC from "../../../middlewares/RBAC.js";
import { search } from "../../../middlewares/queryValidator.js";

const permissions = [
  {
    api: "reseller-collection",
    endpoint: "/api/reseller-collections",
    method: "POST",
    handler: "Create Reseller collection",
  },
  {
    api: "reseller-collection",
    endpoint: "/api/reseller-collections",
    method: "GET",
    handler: "List reseller-collections",
  },
  {
    api: "reseller-collection",
    endpoint: "/api/reseller-collections/:id",
    method: "GET",
    handler: "List Single reseller-collection",
  },
  {
    api: "reseller-collection",
    endpoint: "/api/reseller-collections/:id",
    method: "PUT",
    handler: "Update reseller-collection",
  },
  {
    api: "reseller-collection",
    endpoint: "/api/reseller-collections/:id",
    method: "DELETE",
    handler: "Delete reseller-collection",
  },
  {
    api: "reseller-collection",
    endpoint: "/api/reseller-collections/:id/products",
    method: "GET",
    handler: "List reseller-collection's products",
  },
  {
    api: "reseller-collection",
    endpoint: "/api/reseller-collections/:id/products/search",
    method: "GET",
    handler: "Search reseller-collection's products",
  },
];

router.post("/", [RABC, validateCreateCollection], create);
router.put("/:id", [RABC, validateUpdateCollection], update);
router.get("/", find);
router.get("/:id", findOne);
router.delete("/:id", [RABC], _delete);
router.get("/:id/products", getProductsByCollection);
router.get("/:id/products/search", [search], searchProductsInCollection);

export default (app) => {
  app.use("/api/reseller-collections", router);
};

const _permissions = permissions;
export { _permissions as permissions };
