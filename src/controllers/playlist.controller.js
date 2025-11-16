import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    //might add videoIds, owner, etc. in the future or in a separate endpoint
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id // Assuming req.user is populated with the authenticated user
    })
    res.status(201).json(new ApiResponse(true, "Playlist created successfully", playlist))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    const playlists = await Playlist.find({owner: userId})
        .populate("owner", "name email") // Populate owner details
        .populate("videos", "title thumbnail") // Populate video details if needed
        .sort({createdAt: -1}) // Sort by creation date, newest first
    res.status(200).json(new ApiResponse(true, "User playlists fetched successfully", playlists))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId)
        .populate("owner", "name email")
        .populate("videos", "title thumbnail")
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    res.status(200).json(new ApiResponse(true, "Playlist fetched successfully", playlist))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: add video to playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in the playlist")
    }
    playlist.videos.push(videoId)
    await playlist.save()
    res.status(200).json(new ApiResponse(true, "Video added to playlist successfully", playlist))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video does not exist in the playlist")
    }
    playlist.videos = playlist.videos.filter(id => id.toString() !== videoId)
    await playlist.save()
    res.status(200).json(new ApiResponse(true, "Video removed from playlist successfully", playlist))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    await Playlist.findByIdAndDelete(playlistId)
    res.status(200).json(new ApiResponse(true, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (name) playlist.name = name
    if (description) playlist.description = description
    await playlist.save()
    res.status(200).json(new ApiResponse(true, "Playlist updated successfully", playlist))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}