import { Router } from "express";
const router = Router();
import { create, update, find, findOne, _delete } from "../controllers/tutorial.js";
import { validateCreateTutorial, validateUpdateTutorial } from "../middlewares/tutorial.js";
import RABC from "../../../middlewares/RBAC.js";

const permissions = [
  {
    api: "tutorial",
    endpoint: "/api/tutorial",
    method: "POST",
    handler: "Create Tutorial",
  },
  {
    api: "tutorial",
    endpoint: "/api/tutorial",
    method: "GET",
    handler: "List Tutorials",
  },
  {
    api: "tutorial",
    endpoint: "/api/tutorial/:id",
    method: "GET",
    handler: "Find One Tutorial",
  },
  {
    api: "tutorial",
    endpoint: "/api/tutorial/:id",
    method: "PUT",
    handler: "Update Tutorial",
  },
  {
    api: "tutorial",
    endpoint: "/api/tutorial/:id",
    method: "DELETE",
    handler: "Delete Tutorial",
  },
];

export default (app) => {
  router.post("/", [RABC, validateCreateTutorial], create);
  router.put("/:id", [RABC, validateUpdateTutorial], update);
  router.get("/", find);
  router.get("/:id", findOne);
  router.delete("/:id", _delete);

  app.use("/api/tutorial", router);
};

const _permissions = permissions;
export { _permissions as permissions };
