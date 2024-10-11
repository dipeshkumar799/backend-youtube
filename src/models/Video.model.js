import mongoose from "mongoose";

const { Schema } = mongoose;

const videoSchema = new Schema(
  {
    videofile: {
      // Cloudinary
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
  },
  {
    timestamps: true,
  }
);

export const Video = mongoose.model("Video", videoSchema);
