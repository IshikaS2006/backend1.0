import { asynchandler } from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import ApiResponse from "../utils/ApiResponse.js";

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

    const createdUser = await User.findById(user._id).select("-password -refreshTokens -__v");

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, "User registered successfully", createdUser));
});

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
    const userData = await User.findById(user._id).select("-password -refreshTokens -__v");

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

const logoutUser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: null } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("refreshToken", null, options)
        .cookie("accessToken", null, options)
        .json(new ApiResponse(200, "Logout successful", null));
});

export { registerUser, loginUser, logoutUser };
