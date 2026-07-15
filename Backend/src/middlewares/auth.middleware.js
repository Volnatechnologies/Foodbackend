import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma.js";
import {api_error} from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";

export const authMiddleware = asyncHandler(async(req, res, next) => {
    try {
        // Accept token from Authorization header or cookie fallback
        const headerToken = req.headers.authorization?.split(" ")[1];
        const cookieToken = req.cookies?.accessToken || req.cookies?.token;
        const token = headerToken || cookieToken;

        if (!token) {
          console.error('[Auth] no token found in header or cookies');
          throw new api_error("Unauthorized: No token provided", 401);
        }

        let decoded;
        try {
          decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
          console.error('[Auth] token verification failed', err.name, err.message);
          if (err.name === 'TokenExpiredError') {
            return next(new api_error('Unauthorized: Token expired', 401));
          }
          return next(new api_error('Unauthorized: Invalid token', 401));
        }

        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, mobileNumber: true },
        });

        if (!user) {
          console.error('[Auth] user not found for id', decoded.userId);
          throw new api_error("Unauthorized: User not found", 401);
        }

        req.user = {
          id: user.id,
          email: user.email,
          mobileNumber: user.mobileNumber,
        };

        console.log('[Auth] authenticated user', req.user.id);
        next();
    } catch (error) {
        console.error("Authentication error:", error?.message || error);
        if (error.name === "JsonWebTokenError") {
            return next(new api_error("Unauthorized: Invalid token", 401));
        }
        next(error);
    }
});