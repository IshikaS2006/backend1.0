import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import ApiResponse from "../utils/ApiResponse.js";
import delOldImg from "../utils/delOldImg.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (user) => {
    try {
        const existingUser = await User.findById(user._id);
        if (!existingUser) {
            throw new ApiError(404, "User not found for token generation");
        }
        const accessToken = existingUser.generateAccessToken();
        const refreshToken = existingUser.generateRefreshToken();
        existingUser.refreshToken = refreshToken;

        await existingUser.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new ApiError(500, "Failed to generate tokens");
    }
};

const registerUser = asynchandler(async (req, res) => {
    console.log('--- registerUser called ---');
    console.log('Headers:', { 'content-type': req.headers['content-type'] });
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    // Registration logic here
    //get user detail from frontend
    //validate user detail
    //check if user already exists
    //check for img and avatar
    //upload img to cloudinary
    //create user object for database
    //remove password from response and refresh token
    //check for user creation//

    //return response

    const { fullname, email, password } = req.body;
    console.log(email);

    if ([fullname, email, password].some((x) => x?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { fullname }]
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }
    // multer with upload.fields(...) populates req.files
    const avatarlocalfilepath = req.files?.avatar?.[0]?.path;
    const coverimagelocalfilepath = req.files?.img?.[0]?.path;

    if (!avatarlocalfilepath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatarUploadResponse = await uploadOnCloudinary(avatarlocalfilepath);
    let coverImageUploadResponse = null;

    if (coverimagelocalfilepath) {
        coverImageUploadResponse = await uploadOnCloudinary(coverimagelocalfilepath);
    }

    if (!avatarUploadResponse) {
        throw new ApiError(500, "Failed to upload avatar image");
    }
    // Only fail if a cover image was provided but upload failed
    if (coverimagelocalfilepath && !coverImageUploadResponse) {
        throw new ApiError(500, "Failed to upload cover image");
    }

    const user = await User.create({
        fullname,
        email,
        password,
        avatar: avatarUploadResponse?.url,
        coverImage: coverImageUploadResponse?.url || undefined,
        username: email.split('@')[0],
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken -__v");

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, "User registered successfully", createdUser));
});


// LOGIN USER
const loginUser = asynchandler(async (req, res) => {
    const { username, password, email } = req.body;

    if ([username, password].some((x) => x?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    const userData = await User.findById(user._id).select("-password -refreshToken -__v");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, "Login successful", { user: userData, accessToken, refreshToken }));
});


// LOGOUT USER
const logoutUser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("refreshToken",  options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, "Logout successful", {}));
});


// CHANGE PASSWORD
const changePassword = asynchandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if ([oldPassword, newPassword].some((x) => x?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, "Password changed successfully", null));
});


// CURRENT USER
const getcurrentUser = asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken -__v");

    return res
        .status(200)
        .json(new ApiResponse(200, "Current user fetched successfully", user));
});


// UPDATE ACCOUNT
const updateAccountDetails = asynchandler(async (req, res) => {
    const { fullname, email, username } = req.body;

    if ([fullname, email, username].some((x) => x?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullname, email, username } },
        { new: true, runValidators: true }
    ).select("-password -refreshToken -__v");

    return res
        .status(200)
        .json(new ApiResponse(200, "Account details updated successfully", user));
});


// UPDATE AVATAR
const avatarUpdate = asynchandler(async (req, res) => {
    const avatarlocalfilepath = req.file?.path;

    if (!avatarlocalfilepath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarlocalfilepath);

    if (!avatar.url) {
        throw new ApiError(400, "Avatar upload failed");
    }

    const userRecord = await User.findById(req.user._id);
    await delOldImg(userRecord.avatar);

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password -refreshToken -__v");

    return res
        .status(200)
        .json(new ApiResponse(200, "Avatar updated successfully", avatar.url));
});


// UPDATE COVER IMAGE
const coverImageUpdate = asynchandler(async (req, res) => {
    const coverlocalfilepath = req.file?.path;

    if (!coverlocalfilepath) {
        throw new ApiError(400, "coverImage image is required");
    }

    const userRecord = await User.findById(req.user._id);
    await delOldImg(userRecord.coverImage);

    const coverImage = await uploadOnCloudinary(coverlocalfilepath);

    if (!coverImage.url) {
        throw new ApiError(400, "coverImage upload failed");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password -refreshToken -__v");

    return res
        .status(200)
        .json(new ApiResponse(200, "coverImage updated successfully", coverImage.url));
});


// GET USER CHANNEL PROFILE
const getUserChannelProfile = asynchandler(async (req, res) => {
    const { username } = req.params;

    if (!username || username.trim() === "") {
        throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate([
        {
            $match: { username: username?.toLowerCase().trim() }
        },
        {
            $lookup: {
                from: "subscribers",
                localField: "_id",
                foreignField: "channelId",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscriptionsTo"
            }
        },
        {
            $addFields: {
                subscriberCount: { $size: "$subscribers" },
                subscriptedToCount: { $size: "$subscriptionsTo" },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscriberCount: 1,
                subscriptedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ]);

    if (channel.length === 0) {
        throw new ApiError(404, "Channel not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Channel profile fetched successfully", channel[0])
        );
});

const getWatchHistory = asynchandler(async (req, res) => {
    // Implementation for fetching watch history
    const user= await User.aggregate([
        {
            $match: { _id: req.user._id }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchedVideos",
                pipeline: [
                    { $project: { fullname:1,  username:1, avatar:1, }}, 
                    {
                        $addFields: {
                            owner: "$owner"
                        }
                    }
                ]
            }   
            }

        
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, "Watch history fetched successfully", user[0].watchedVideos));
});

// REFRESH TOKEN
const refreshToken = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request - no refresh token");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?.userId);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user);

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    "Access token refreshed",
                    { accessToken, refreshToken: newRefreshToken }
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

// EXPORTS
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    changePassword,
    getcurrentUser as getCurrentUser,
    updateAccountDetails,
    avatarUpdate,
    coverImageUpdate,
    getUserChannelProfile as getUserProfileByUsername,
    getWatchHistory as getUserHistory, 
    
};
