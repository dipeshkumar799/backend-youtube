import mongoose from "mongoose";

const likeSchema = new Schema(
    {
        comment: {
            type: Schema.Types.ObjectId,
            ref: "comment",
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
            ref: "tweet",
        },
    },
    { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
