import { Router } from "express";
const router = Router();
import { create, find, } from "../controllers/metric.js";
// import { validateRequest } from "../middlewares/notification.js";

const permissions = [
    {
        api: "metrics",
        endpoint: "/api/metrics",
        method: "POST",
        handler: "Create metric",
    },
    {
        api: "metrics",
        endpoint: "/api/metrics",
        method: "GET",
        handler: "List metrics",
    },
];

export default (app) => {
    router.post("/", create);
    router.get("/", find);
    app.use("/api/metrics", router);
};

const _permissions = permissions;
export { _permissions as permissions };
