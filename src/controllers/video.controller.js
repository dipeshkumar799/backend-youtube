import mongoose from "mongoose";
import { Video } from "../models/video.model.js"; // Assuming you have a Video model
import { ApiError } from "../utils/ApiError.js"; // Custom error class for handling errors
import { asyncHandler } from "../utils/asyncHandler.js"; // Utility to handle async errors
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Function to upload videos to Cloudinary

// Get all videos
const getAllVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find(); // Fetch all videos from the database
    return res.status(200).json(videos); // Send the videos as a response
});

// Publish a video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body; // Get title and description from the request body

    // Check if a file was uploaded
    if (!req.file) {
        throw new ApiError(400, "Video file is required."); // Throw error if no file
    }

    // Upload video to Cloudinary and get the URL
    const videoData = await uploadOnCloudinary(req.file.path);

    // Create a new video record in the database
    const video = new Video({
        title,
        description,
        videoUrl: videoData.url, // Store the video URL
    });

    await video.save(); // Save the video to the database

    return res.status(201).json(video); // Respond with the created video
});

// Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params; // Get video ID from request parameters

    const video = await Video.findById(videoId); // Find video by ID

    if (!video) {
        throw new ApiError(404, "Video not found."); // Throw error if video not found
    }

    return res.status(200).json(video); // Respond with the found video
});

// Update video details
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params; // Get video ID from request parameters
    const { title, description } = req.body; // Get new title and description

    const video = await Video.findByIdAndUpdate(
        videoId,
        { title, description },
        { new: true } // Return the updated video
    );

    if (!video) {
        throw new ApiError(404, "Video not found."); // Throw error if video not found
    }

    return res.status(200).json(video); // Respond with the updated video
});

// Delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params; // Get video ID from request parameters

    const video = await Video.findByIdAndDelete(videoId); // Delete the video

    if (!video) {
        throw new ApiError(404, "Video not found."); // Throw error if video not found
    }

    return res.status(200).json({ message: "Video deleted successfully." }); // Respond with success message
});

// Export functions to use in routes
export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo };
