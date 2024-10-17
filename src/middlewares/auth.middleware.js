import { asyncHandler } from "../utiles/asyncHandler.js";
import { ApiError } from "../utiles/apiError.js";
import { User } from "../models/User.model.js";
import jwt from "jsonwebtoken";
//this middle ware very user hai ya nahi
const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization ").replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        );
        if (!user) {
            throw new ApiError("invalid token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw ApiError(400, "token is invalid");
    }
});
export { verifyJwt };
