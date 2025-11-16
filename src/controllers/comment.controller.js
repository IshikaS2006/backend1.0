import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const comments = await Comment.find({video: videoId})
        .populate("author", "name email")
        .sort({createdAt: -1}) // Sort by creation date, newest first
        .skip((page - 1) * limit)
        .limit(Number(limit))
    if (!comments || comments.length === 0) {
        throw new ApiError(404, "No comments found for this video")
    }
    res.status(200).json(new ApiResponse(true, "Comments retrieved successfully", comments))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty")
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        author: req.user._id // Assuming req.user is populated with the authenticated user
    })
    res.status(201).json(new ApiResponse(true, "Comment added successfully", comment))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }   
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty")
    }
    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {content},
        {new: true, runValidators: true} // Return the updated document and validate
    )
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    res.status(200).json(new ApiResponse(true, "Comment updated successfully", comment))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    const comment = await Comment.findByIdAndDelete(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    res.status(200).json(new ApiResponse(true, "Comment deleted successfully", comment))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }