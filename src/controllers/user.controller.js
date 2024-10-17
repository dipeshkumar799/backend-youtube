import { asyncHandler } from "../utiles/asyncHandler.js";
import { ApiError } from "../utiles/apiError.js";
import { User } from "../models/User.model.js";
import { apiResponse } from "../utiles/apiResponse.js";
import { uploadOnCloudinary } from "../utiles/cloudnary.js";
const generateAccessTokenToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        // 1. Fetch the user by their ID from the database.
        const accessToken = await user.generateAcessToken();
        // 2. Generate an access token (used for user authentication).
        const refreshToken = await user.generateRefreshToken();
        // 3. Generate a refresh token (used to obtain a new access token when the current one expires)
        user.refreshToken = refreshToken;
        // 4. Assign the generated refresh token to the user object (typically stored in the database).
        await user.save({ validateBeforeSave: true });
        return { accessToken, refreshToken }; //Both the accessToken and the refreshToke (refresh token) are returned as an object. This allows the calling code to use these tokens, for example, to send them to the user.
    } catch (error) {
        throw new ApiError(400, "something went wrong while generating token");
    }
};
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
    console.log([username, email, password, fullname]);
    if (
        [username, email, password, fullname].some(
            (fields) => fields?.trim() === ""
        ) // some used for to check some
    ) {
        throw new ApiError(400, "All field most be required");
    }

    const existedUser = await User.findOne({
        $or: [
            {
                username,
            },
            {
                email,
            },
        ],
    });
    console.log(existedUser);
    if (existedUser) {
        throw new ApiError(409, "User Already Exist");
    }
    const avatarLocalPath = await req.files?.avatar[0]?.path;
    // If req.files exists, check for req.files.avatar.
    //If req.files.avatar exists and is an array, check for the first element [0].
    //If req.files.avatar[0] exists, access its path property.
    // If any of these are missing, it will simply return undefined instead of throwing an error.
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar image is required");
    }
    console.log(avatarLocalPath);
    const coverLocalPath = await req.files?.coverImage[0]?.path;
    console.log(coverLocalPath);

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);
    if (!avatar || !coverImage) {
        throw new ApiError(400, "avatar and coverImage file is required");
    }

    const user = await User.create({
        username,
        fullname,
        email,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        password,
    });
    console.log(user);
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    console.log("the cretaed user", createdUser);

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while creating ");
    }
    return res.status(200).json({
        status: "success",
        data: createdUser,
        message: "User registered successfully",
    });
});

const loginUser = asyncHandler(async () => {
    //take input from email or username and password
    //email find in db if email then email already exit
    //password check if wrong then worng
    //if no then
    //refresh and access token generate  send them  to user
    //send in cookies
    const { email, password, username } = req.body;
    if (!email || (!username && !password)) {
        throw new ApiError(
            404,
            "email or username and password must be required"
        );
    }
    const user = await User.findOne({
        $or: [
            {
                email,
            },
            {
                username,
            },
        ],
    });
    if (!user) {
        throw new ApiError(400, "user doesn't exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(404, "password invalid");
    }
    //when password is valid then it
    const { accessToken, refreshToken } = await generateAccessTokenToken(
        user._id
    );
    const loggedInUser = await User.findById(user._id).select(
        "-password  -refreshToken"
    );
    //it means doesn't allow to modify from frontend
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "user loggedin successfull"
            )
        );
});
export { registerUser, loginUser };
