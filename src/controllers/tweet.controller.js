import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create a tweet
    const {userId, content} = req.body

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const tweet = new Tweet({
        user: userId,   
        content: content
    })
    await tweet.save()
    res.status(201).json(new ApiResponse(201, "Tweet created successfully", tweet))    
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const tweets = await Tweet.find({ user: userId })
    res.status(200).json(new ApiResponse(200, "User tweets retrieved successfully", tweets))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body  
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    tweet.content = content || tweet.content
    await tweet.save()
    res.status(200).json(new ApiResponse(200, "Tweet updated successfully", tweet))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    await tweet.remove()
    res.status(200).json(new ApiResponse(200, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}