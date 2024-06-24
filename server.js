import express from 'express'
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
const app = express()

app.use(cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization", "authorization"]
}))
app.use(express.json({ limit: "10mb" }))
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use((req, res, next) => {
    req.endpoint = req.url.split("?")[0]
    next()
})
app.use(morgan("dev"))
export default app