import { mongoose, Schema } from "mongoose";

const likeSchema = new Schema(
    {
        comment: {
            type: String,
            required: true,
            trim: true,
        },

        Video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        like: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        tweet: {
            type: Schema.Types.ObjectId,
        },
    },
    { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
