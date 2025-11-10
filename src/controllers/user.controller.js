import {asynchandler} from "../utils/asynchandler.js";
import ApiError  from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
const registerUser = asynchandler(async (req, res) => {
    // Registration logic here
    res.status(201).json({ message: "User registered successfully" });
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
    const existingUser = await User.findOne(
        {
            $or: [{ email }, { fullname }]
        }
    );
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }
    const avatarlocalfilepath = req.file?.avatar[0]?.path;
    const coverimagelocalfilepath = req.file?.image[0]?.path;
    if (!avatarlocalfilepath ) {
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
    if (!coverImageUploadResponse) {
        throw new ApiError(500, "Failed to upload cover image");
    }

    const user = await User.create({
        fullname,
        email,
        password,
        avatar: {
            public_id: avatarUploadResponse.public_id,
            url: avatarUploadResponse.secure_url,
        },
        coverImage: coverImageUploadResponse
            ? {
                    public_id: coverImageUploadResponse.public_id,
                    url: coverImageUploadResponse.secure_url,
                }
            : null,
            username: email.split('@')[0],
    });
    const createdUser = await User.findById(user._id).select("-password -refreshTokens -__v");
    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }
    return res.status(201).json(new ApiResponse(201, "User registered successfully", createdUser));
});

export { registerUser };