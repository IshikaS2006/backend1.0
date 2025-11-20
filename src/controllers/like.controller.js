import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const existingLike = await Like.findOne({video: videoId, likedBy: req.user._id})
    if (existingLike) {
        // If like exists, remove it
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(true, "Like removed successfully"))
    }
    const newLike = await Like.create({video: videoId, likedBy: req.user._id})
    res.status(201).json(new ApiResponse(true, "Like added successfully", newLike))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    const existingLike = await Like.findOne({comment: commentId, likedBy: req.user._id})
    if (existingLike) {
        // If like exists, remove it
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(true, "Like removed successfully"))
    }
    const newLike = await Like.create({comment: commentId, likedBy: req.user._id})
    res.status(201).json(new ApiResponse(true, "Like added successfully", newLike))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    const existingLike = await Like.findOne({tweet: tweetId, likedBy: req.user._id})
    if (existingLike) {
        // If like exists, remove it
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(true, "Like removed successfully"))
    }
    const newLike = await Like.create({tweet: tweetId, likedBy: req.user._id})
    res.status(201).json(new ApiResponse(true, "Like added successfully", newLike))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    //need to use aggregation pipeline to get all liked videos by the user}
    const likedVideos = await Like.aggregate([
        { $match: { likedBy: mongoose.Types.ObjectId(req.user._id), video: { $ne: null } } },
        { $lookup: {
            from: 'videos',
            localField: 'video',
            foreignField: '_id',
            as: 'videoDetails'
        }},
        { $unwind: "$videoDetails" }
    ])

    res.status(200).json(new ApiResponse(true, "Liked videos retrieved successfully", likedVideos))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}