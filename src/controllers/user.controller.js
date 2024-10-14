import { asyncHandler } from "../utiles/asyncHandler.js";
import { ApiError } from "../utiles/apiError.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utiles/cloudnary.js";
const registerUser = asyncHandler(async (req, res) => {
    //get user input like username,email,password..etc from frontend
    //user validation
    //check user is already exist in db or not
    //then check image is in or not
    //upload them in cloudinary
    //create user object - create entry in db
    //remove password and refresh token  field form response
    //check for user  creation
    //return response
    const { username, email, password, fullname } = req.body;

    if (
        [username, email, password, fullname].some(
            (fields) => fields?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All field most be required");
    }

    const existedUser = User.findOne({
        $or: [
            {
                username,
            },
            {
                email,
            },
        ],
    });
    if (existedUser) {
        throw new ApiError(409, "User Already Exist");
    }
    const avatarLocalPath = await req.files?.avatar[0]?.path;
    const coverLocalPath = await req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar image is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);
    if (!avatar) {
        throw new ApiError(400, "avatar file is required");
    }

    const user = await User.create({
        username,
        email,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        password,
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken:"
    );
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while creating ");
    }
    return res
        .status(200)
        .json(200, createdUser, "user registered successfully");
});
export { registerUser };
