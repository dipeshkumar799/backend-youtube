import { asyncHandler } from "../utiles/asyncHandler";
import { ApiError } from "../utiles/apiError";
import { apiResponse } from "../utiles/apiResponse";
import { Comment } from "../models/comment.model";
import { asyncHandler } from "../utiles/asyncHandler";
import { ApiError } from "../utiles/apiError";
import { apiResponse } from "../utiles/apiResponse";
import { Comment } from "../models/comment.model";
import mongoose from "mongoose";

// Get all comments for a specific video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params; // Get videoId from the request parameters
    const { page = 1, limit = 10 } = req.query; // Default pagination values

    // Ensure the videoId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError("Invalid video ID", 400);
    }

    // Query for comments related to the video
    const comments = await Comment.find({ video: videoId })
        .populate("owner", "username") // Populate owner field to get username
        .skip((page - 1) * limit) // Pagination skip
        .limit(limit) // Limit results
        .sort({ createdAt: -1 }); // Sort comments by creation date

    return res
        .status(200)
        .json(apiResponse(200, comments, "Comments fetched successfully"));
});

const createComment = asyncHandler(async (req, res) => {
    const { content, video, owner } = req.body;

    if (!content || !video || !owner) {
        throw new ApiError("All fields must be required", 400);
    }

    const newComment = new Comment({
        content,
        video,
        owner,
    });

    const savedComment = await newComment.save();

    return res
        .status(201)
        .json(apiResponse(201, savedComment, "Comment created successfully")); //
});

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body; // Get content from request body
    const { videoId } = req.params; // Get videoId from request parameters

    // Validate input
    if (!content || !videoId) {
        throw new ApiError("Content and video ID are required", 400);
    }

    // Ensure the videoId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError("Invalid video ID", 400);
    }

    // Create a new comment
    const newComment = new Comment({
        content,
        video: videoId,
        owner: req.user.id, // Assuming you have user authentication and can access the user ID
    });

    const savedComment = await newComment.save(); // Save the comment
    return res
        .status(201)
        .json(ApiResponse(201, savedComment, "Comment added successfully"));
});
// Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params; // Get commentId from request parameters
    const { content } = req.body; // Get new content from request body

    // Ensure the commentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError("Invalid comment ID", 400);
    }

    // Find and update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true } // Return the updated document
    );

    if (!updatedComment) {
        throw new ApiError("Comment not found", 404);
    }

    return res
        .status(200)
        .json(ApiResponse(200, updatedComment, "Comment updated successfully"));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params; // Get commentId from request parameters

    // Ensure the commentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError("Invalid comment ID", 400);
    }

    // Find and delete the comment
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError("Comment not found", 404);
    }

    return res
        .status(200)
        .json(ApiResponse(200, null, "Comment deleted successfully"));
});

export { createComment };
