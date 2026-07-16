import prisma from "../prisma/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { api_error } from "../utils/errorHandler.js";

export const restaurantMiddleware = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
    });

    if (!restaurant) {
        throw new api_error(404, "Restaurant not found.");
    }

    if (restaurant.userId !== req.user.id) {
        throw new api_error(
            403,
            "You are not authorized to access this restaurant."
        );
    }

    req.restaurant = restaurant;

    next();
});