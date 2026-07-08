import User from "../models/user.model.js";
import { api_error } from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";


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

    const existingUser = await User.findOne({
        $or: [
            { email },
            { mobileNumber }
        ]
    });
    if(existingUser){
        if (existingUser.email === email) {
            throw new api_error(400, "Email already exists");
        }

        if (existingUser.mobileNumber === mobileNumber) {
            throw new api_error(400, "Mobile number already exists");
        }
    }

    const user = await User.create({ mobileNumber, password, email, role });
    const token = user.generateAccessToken();

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
                id: user._id,
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
    
    const user = await User.findOne({
        $or: [
            { email },
            { mobileNumber }
        ]
    });
    if (!user) {
        throw new api_error(401, "Invalid email or mobileNumber");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new api_error(401, "Invalid email or password");
    }

    const token = user.generateAccessToken();

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
                id: user._id,
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