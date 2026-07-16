import prisma from "../prisma/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { api_error } from "../utils/errorHandler.js";

export const createRestaurant = asyncHandler(async (req, res) => {
    let {
        restaurantName,
        restaurantType,
        contactNumber,
        email,
        fssaiNumber,
        establishedYear,
        cuisineTypes,
    } = req.body;

    restaurantName = restaurantName?.trim();
    contactNumber = contactNumber?.trim();
    email = email?.trim().toLowerCase();

    if (
        !restaurantName ||
        !restaurantType ||
        !contactNumber ||
        !email ||
        !Array.isArray(cuisineTypes) ||
        cuisineTypes.length === 0
    ) {
        throw new api_error(
            400,
            "Restaurant name, restaurant type, contact number, email and cuisine types are required."
        );
    }

    try {
        const restaurant = await prisma.restaurant.create({
            data: {
                userId: req.user.id,
                restaurantName,
                restaurantType,
                contactNumber,
                email,
                fssaiNumber,
                establishedYear,
                cuisineTypes,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Restaurant created successfully.",
            data: {
                id: restaurant.id,
                restaurantName: restaurant.restaurantName,
                currentStep: restaurant.currentStep,
                status: restaurant.status,
            }
        });

    } catch (err) {

        if (err.code === "P2002") {
            const field = err.meta?.target?.[0];

            const errors = {
                userId: "You have already registered a restaurant.",
                email: "Restaurant email already exists.",
                contactNumber: "Contact number already exists.",
            };

            throw new api_error(409, errors[field] || "Duplicate data.");
        }

        throw err;
    }
});