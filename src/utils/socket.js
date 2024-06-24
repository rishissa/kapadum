import { Server } from "socket.io";
import cors from "cors"
let connectedUsers = 0;
export const initializSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            // allowedHeaders: ["Content-Type", "Authorization", "authorization"],
            // credentials: true
        }
    })
    // console.log(io.sockets.connected)
    io.on("connection", (socket) => {
        console.log(socket.id)
        connectedUsers += 1

        io.emit("live-users", ({ count: connectedUsers }))
        socket.on("disconnect", () => {
            console.log("User Disconnected", socket.id);
            connectedUsers += -1
            io.emit("live-users", ({ count: connectedUsers }))
        });
    })

}