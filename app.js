import { config } from "dotenv";
config();
import app from "./server.js";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import syntaxErrorhandler from "./src/middlewares/syntaxErrorhandler.js";
import notFoundHandler from "./src/middlewares/notFoundHandler.js";
import instance_starter from "./src/utils/instance_starter.js";
instance_starter();
import { initializSocket } from "./src/utils/socket.js";
import { createServer } from "http";
const server = createServer(app);
initializSocket(server);
app.use(morgan("dev"));
app.use(syntaxErrorhandler);
app.set("view engine", "ejs");
import "./src/utils/routes.js";
app.use(notFoundHandler);
// Start the server
const PORT = process.env.PORT || 4599;
server.listen(PORT);


