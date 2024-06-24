
import { create, find } from '../controllers/setting.js';
const router = Router();

import { Router } from "express";
import RBAC from "../../../middlewares/RBAC.js";
import { validateRequest } from "../middlewares/setting.js";

const permissions = [
    {
        api: "settings",
        endpoint: "/api/settings",
        method: "POST",
        handler: "Create Setting",
    },
    {
        api: "settings",
        endpoint: "/api/settings",
        method: "GET",
        handler: "List Setting",
    },
];

export default (app) => {
    router.post("/", [validateRequest], create);
    router.get("/", [validateRequest], find);
    app.use("/api/settings", router);
};

const _permissions = permissions;
export { _permissions as permissions };

