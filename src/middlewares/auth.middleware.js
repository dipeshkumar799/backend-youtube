import { asyncHandler } from "../utiles/asyncHandler.js";
import { ApiError } from "../utiles/apiError.js";
import { User } from "../models/user.model.js";

import jwt from "jsonwebtoken";

// Middleware to check if the user is authenticated via JWT
const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        // Fetch token from cookies or Authorization header
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        //req.header("Authorization")?.split("")
        // Check if token exists
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Verify the token using the secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Fetch the user from the database using the decoded token's ID
        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        );

        // Check if the user exists
        if (!user) {
            throw new ApiError(401, "Invalid token");
        }

        // Attach user to request object and proceed
        req.user = user;
        next();
    } catch (error) {
        // Catch any errors related to the token
        throw new ApiError(401, "Token is invalid");
    }
});

export { verifyJwt };
