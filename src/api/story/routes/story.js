
// src/api/post/postRoutes.js
import { Router } from "express"
const router = Router();
import { create, find, findOne, update, _delete } from '../controllers/story.js';

// Define routes for the "Post" resource
const permissions = [
    {
        api: "stories",
        endpoint: "/api/stories",
        method: "POST",
        handler: "Create stories",
    },
    {
        api: "stories",
        endpoint: "/api/stories",
        method: "GET",
        handler: "List storiess",
    },
    {
        api: "stories",
        endpoint: "/api/stories/:id",
        method: "GET",
        handler: "Find One stories",
    },
    {
        api: "stories",
        endpoint: "/api/stories/:id",
        method: "PUT",
        handler: "Update stories",
    },
    {
        api: "stories",
        endpoint: "/api/stories/:id",
        method: "DELETE",
        handler: "Delete stories",
    },
];

export default (app) => {
    router.post('/', create);
    router.get('/', find);
    router.get('/:id', findOne);
    router.put('/:id', update);
    router.delete('/:id', _delete);
    app.use('/api/stories', router)
}

const _permissions = permissions;
export { _permissions as permissions };