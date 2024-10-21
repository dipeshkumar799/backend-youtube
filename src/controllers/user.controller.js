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
    // console.log([username, email, password, fullname]);
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
    // console.log(user);
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    // console.log("the cretaed user", createdUser);

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while creating ");
    }
    return res.status(200).json({
        status: "success",
        data: createdUser,
        message: "User registered successfully",
    });
});

const loginUser = asyncHandler(async (req, res) => {
    //take input from email or username and password
    //email find in db if email then email already exit
    //password check if wrong then worng
    //if no then
    //refresh and access token generate  send them  to user
    //send in cookies
    const { email, password, username } = req.body;

    if ((!email || !username) && !password) {
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
    // console.log("dipesh", user);
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
const loggedOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined,
        },
    });
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ message: "User logged out successfully" });
});
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken =
        (await req.cookies.refreshToken) || req.body.refreshToken;
    //this token access from client

    if (!incommingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }
    const decodedToken = await jwt.verify(
        incommingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
        throw new ApiError(401, "unauthorized user");
    }
    if (incommingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "refresh token is expired");
    }
    const options = {
        httpOnly: true,
        secure: true,
    };
    const { accessToken, newRefreshToken } = await generateAccessTokenToken(
        user?._id
    );
    return res
        .status(200)
        .cookies("accessToken", accessToken, options)
        .cookies("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    accessToken,
                    newRefreshToken,
                },
                "new refresh-token has been created"
            )
        );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { newPassword, oldPassword, confirmPassword } = req.body;

    // Check if newPassword and oldPassword are provided
    if (!newPassword || !oldPassword || !confirmPassword) {
        throw new ApiError(
            400,
            "Both newPassword and oldPassword are required"
        );
    }
    if (!(confirmPassword === newPassword)) {
        throw new ApiError(
            401,
            " newPassword  and confirmPassword doesn't match "
        );
    }

    // Find the user by ID
    const user = await User.findById(req.user?._id); //this user come from auth.js files
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if the old password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError((401, "Old password doesn't match"));
    }

    // Hash the new password before saving (assuming user has a method for password hashing)
    user.password = newPassword; // You may want to hash it inside the User model

    // Save the updated user
    await user.save({ validateBeforeSave: true });

    // Respond to the client
    res.status(200).json({ message: "Password changed successfully" });
});

//or
// const changeCurrentPassword = asyncHandler(async (req, res) => {
//     const { newPassword, oldPassword } = req.body;

//     // Check if newPassword and oldPassword are provided
//     if (!newPassword || !oldPassword) {
//         throw new ApiError(400, "Both newPassword and oldPassword are required");
//     }

//     // Find the user by ID
//     const user = await User.findById(req.user?._id);
//     if (!user) {
//         throw new ApiError(404, "User not found");
//     }

//     // Check if the old password is correct
//     const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
//     if (!isPasswordCorrect) {
//         throw new ApiError(401, "Old password doesn't match");
//     }

//     // Hash the new password before updating (if not handled automatically by the model)
//     const hashedNewPassword = await user.hashPassword(newPassword); // Assuming hashPassword is a method in the User model

//     // Update the user's password using $set
//     await User.findByIdAndUpdate(user._id, {
//         $set: {
//             password: hashedNewPassword
//         }
//     });

//     // Respond to the client
//     res.status(200).json({ message: "Password changed successfully" });
// });
const currentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current user fetch successfully");
});
const updateAccountDetail = asyncHandler(async (req, res) => {
    const { username, fullname, email } = req.body;
    if (!username || !email || !fullname) {
        throw new ApiError(
            401,
            "username, fullname, and email must be required"
        );
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username: username,
                fullname: fullname,
                email: email,
            },
        },
        { new: true }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const updatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res.status(200).json({
        status: 200,
        message: "User updated successfully",
        data: updatedUser,
    });
});
const upadateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = await req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, " avatar file is not found");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password -refreshToken");
    return res.status(200).json(200, user, "avatar uploaded successfull");
});
const updateCoverImage = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path; // No need for `await` here, it's just accessing the file path
    if (!coverLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath);
    if (!coverImage.url) {
        throw new ApiError(400, "Cover image upload failed");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        { new: true } // Return the updated user
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json({
        success: true,
        message: "Cover image uploaded successfully",
        user,
    });
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(400, "username not found");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "suscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "suscriber",
            },
        },
        {
            $lookup: {
                from: "suscriptions", // Remove the extra space
                localField: "_id",
                foreignField: "suscriber",
                as: "suscribeTo",
            },
        },
        {
            $addFields: {
                suscribersCount: {
                    $size: "$suscriber", // Count of subscribers
                },
                channelSuscribeToCount: {
                    $size: "$suscribeTo", // Count of subscriptions
                },
                isSuscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$suscriber.suscriber"],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                username: 1,
                fullname: 1,
                email: 1,
                suscribersCount: 1,
                channelSuscribeToCount: 1,
                isSuscribed: 1,
                coverImage: 1,
                avatar: 1,
            },
        },
    ]);

    // Check if channel was found
    if (channel.length === 0) {
        return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).json(
        new apiResponse(200, channel, "user channel fetched successfull")
    );
});

export {
    registerUser,
    loginUser,
    loggedOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    currentUser,
    updateAccountDetail,
    upadateAvatar,
    updateCoverImage,
    getUserChannelProfile,
};
