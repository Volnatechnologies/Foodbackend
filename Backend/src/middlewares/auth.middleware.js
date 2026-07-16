import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { api_error } from "../utils/errorHandler.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
    const token =
        req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : req.cookies?.accessToken;

    if (!token) {
        throw new api_error(401, "Unauthorized");
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new api_error(401, "Token expired");
        }

        throw new api_error(401, "Invalid token");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
        select: {
            id: true,
            email: true,
            mobileNumber: true,
            role: true,
        },
    });

    if (!user) {
        throw new api_error(401, "User not found");
    }

    req.user = user;

    next();
});