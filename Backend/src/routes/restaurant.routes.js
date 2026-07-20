import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { restaurantMiddleware } from "../middlewares/restaurant.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { createRestaurant, updateAddress, updateBusinessHours, updateDocuments } from "../controllers/restaurant.controller.js";

const router = Router();

router.post("/", authMiddleware, createRestaurant);
router.put("/:id/address", authMiddleware, restaurantMiddleware, updateAddress)
router.post("/:id/business-hours", authMiddleware, restaurantMiddleware, updateBusinessHours)
router.post(
  "/:id/documents",
  authMiddleware,
  restaurantMiddleware,
  upload.fields([
    { name: "fssaiCertificate", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateDocuments
)

export default router;