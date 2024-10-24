import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
likeSchema.plugin(mongooseAggregatePaginate);
export const Like = mongoose.model("Like", likeSchema);
