import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const { Schema } = mongoose;

const videoSchema = new Schema(
    {
        videofile: {
            // Cloudinary
            type: String,
            required: true,
        },
        thumbnail: {
            // Cloudinary
            type: String,
            required: true,
        },

        title: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        view: {
            type: Number,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);
videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoSchema);
