import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullname: {
            type: string,
            required: true,
            index: true,
        },
        avatar: {
            type: String, //cloudinary url
            required: true,
        },
        coverImage: {
            type: String, //cloudinary url
            required: true,
        },
        watchHistory: [
          {
             type: Schema.Types.ObjectId,
            ref: "Video",
        }
      ],
        refreshToken: {
            type: String,
        },
        password: {
            type: String,
            required: [true,"password is required"]
        },
    },
    { timestamps: true }
);
export const User = mongoose.model("User", userSchema);
