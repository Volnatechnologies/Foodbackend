import dotenv from "dotenv"
dotenv.config()
import http from "http"
import express from "express"
import cors from "cors"

const app = express()
const httpServer = http.createServer(app)
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("API is running");
});

import authRoutes from "./src/routes/auth.route.js"
app.use("/api/v1/auth", authRoutes)

import restaurantRoutes from "./src/routes/restaurant.routes.js"
app.use("/api/v1/restaurant", restaurantRoutes)

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})