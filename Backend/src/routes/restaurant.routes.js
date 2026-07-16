import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createRestaurant } from "../controllers/restaurant.controller.js";

const router = Router();

router.post("/", authMiddleware, createRestaurant);

export default router;