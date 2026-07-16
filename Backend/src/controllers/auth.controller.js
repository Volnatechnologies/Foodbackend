import prisma from "../prisma/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { api_error } from "../utils/errorHandler.js";
import {
    comparePassword,
    generateAccessToken,
    hashPassword,
} from "../utils/userMethods.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
    let { mobileNumber, email, password } = req.body;

    mobileNumber = mobileNumber?.trim();
    email = email?.trim().toLowerCase();

    if (!mobileNumber || !email || !password) {
        throw new api_error(400, "Mobile number, email and password are required");
    }

    try {
        const user = await prisma.user.create({
            data: {
                mobileNumber,
                email,
                password: await hashPassword(password),
                // role omitted → Prisma assigns OWNER
            },
        });

        const token = generateAccessToken(user);

        return res
            .status(201)
            .cookie("accessToken", token, cookieOptions)
            .json({
                success: true,
                message: "User registered successfully",
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        mobileNumber: user.mobileNumber,
                        role: user.role,
                    },
                    token,
                },
            });
    } catch (err) {
        if (err.code === "P2002") {
            const field = err.meta?.target?.[0];

            throw new api_error(
                409,
                `${field === "mobileNumber" ? "Mobile number" : "Email"} already exists`
            );
        }

        throw err;
    }
});

export const login = asyncHandler(async (req, res) => {
    let { email, mobileNumber, password } = req.body;

    email = email?.trim().toLowerCase();
    mobileNumber = mobileNumber?.trim();

    if ((!email && !mobileNumber) || !password) {
        throw new api_error(
            400,
            "Email/mobile number and password are required"
        );
    }

    const user = await prisma.user.findFirst({
        where: email ? { email } : { mobileNumber },
    });

    if (!user || !(await comparePassword(password, user))) {
        throw new api_error(401, "Invalid credentials");
    }

    const token = generateAccessToken(user);

    return res
        .status(200)
        .cookie("accessToken", token, cookieOptions)
        .json({
            success: true,
            message: "User logged in successfully",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    mobileNumber: user.mobileNumber,
                    role: user.role,
                },
                token,
            },
        });
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("accessToken", cookieOptions);

    return res.status(200).json({
        success: true,
        message: "User logged out successfully",
    });
});