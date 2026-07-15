import { api_error } from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../prisma/prisma.js"
import { comparePassword, generateAccessToken, hashPassword } from "../utils/userMethods.js";

export const register = asyncHandler(async (req, res, next) => {
    const { mobileNumber, password, email, role} = req.body;

    if(!mobileNumber){
        throw new api_error(400, "Mobile number is required");
    }
    if(!email){
        throw new api_error(400, "email is required");
    }
    if(!password){
        throw new api_error(400, "password is required");
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { mobileNumber }
            ]
    }
    });
    if(existingUser){
        if (existingUser.email === email) {
            throw new api_error(400, "Email already exists");
        }

        if (existingUser.mobileNumber === mobileNumber) {
            throw new api_error(400, "Mobile number already exists");
        }
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: { mobileNumber, password: hashedPassword, email, role }
    });
    const token = generateAccessToken(user);

    res.status(201)
    .cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
    })
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
    })
})

export const login = asyncHandler(async (req, res, next) => {
    const { mobileNumber, email, password } = req.body;
    if(!mobileNumber && !email){
        throw new api_error(400, "Please provide either email or mobileNumber");
    }
    if(!password){
        throw new api_error(400, "password is required");
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { mobileNumber }
            ]
        }
    });
    if (!user) {
        throw new api_error(401, "Invalid email or mobileNumber");
    }

    const isMatch = await comparePassword(password, user);
    if (!isMatch) {
        throw new api_error(401, "Invalid email or password");
    }

    const token = generateAccessToken(user);

    res.status(200)
    .cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
    })
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
})
})

export const logout = asyncHandler(async (req, res, next) => {
    res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    });
    res.status(200)
    .json({
        success: true,
        message: "User logged out successfully",
    })
})
