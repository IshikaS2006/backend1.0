import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const filter = { isPublished: true }
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    }
    if (userId && isValidObjectId(userId)) {
        filter.owner = mongoose.Types.ObjectId(userId)
    }
    const sortOptions = {}
    if (sortBy) {
        sortOptions[sortBy] = sortType === 'desc' ? -1 : 1
    } else {
        sortOptions.createdAt = -1 // Default sort by creation date descending
    }
    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("owner", "name email")

    res.status(200).json(new ApiResponse(true, "Videos retrieved successfully", videos))
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description } = req.body
    const { videoFile, thumbnail } = req.files
    //upload video and thumbnail to cloudinary
    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }
    const videoFileUrl = await uploadOnCloudinary(videoFile[0].path, "video")
    const thumbnailUrl = await uploadOnCloudinary(thumbnail[0].path, "image")
    if (!videoFileUrl || !thumbnailUrl) {
        throw new ApiError(500, "Failed to upload video or thumbnail")
    }
    //creat an object of title, description, videoFileUrl, thumbnailUrl, duration, owner
    const videoData = {
        title,
        description,
        videoFile: videoFileUrl,
        thumbnail: thumbnailUrl,
        duration: videoFile[0].duration, // Assuming duration is available in the file metadata
        owner: req.user._id // Assuming req.user is populated with the authenticated user
    }
    const video = await Video.create(videoData)
    res.status(201).json(new ApiResponse(true, "Video published successfully", video))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    //find in the database
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId).populate("owner", "name email")
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    res.status(200).json(new ApiResponse(true, "Video retrieved successfully", video))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    const { title, description } = req.body
    const updateData = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (req.file) {
        const thumbnailUrl = await uploadOnCloudinary(req.file.path, "image")
        updateData.thumbnail = thumbnailUrl
    }
    const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, { new: true })
    res.status(200).json(new ApiResponse(true, "Video updated successfully", updatedVideo))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    res.status(200).json(new ApiResponse(true, "Video deleted successfully", null))
    // Optionally, you can also delete the video file from cloud storage if needed
    // await deleteFromCloudinary(video.videoFile)
    // await deleteFromCloudinary(video.thumbnail)
    // res.status(200).json(new ApiResponse(true, "Video deleted successfully", null))
    // when deleted, also delete the video file from cloud storage
    await deleteFromCloudinary(video.videoFile)
    await deleteFromCloudinary(video.thumbnail)
    res.status(200).json(new ApiResponse(true, "Video deleted successfully", null))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle publish status of a video
    //if published, unpublish it and vice versa
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    video.isPublished = !video.isPublished
    await video.save()
    res.status(200).json(new ApiResponse(true, "Video publish status toggled successfully", video))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}