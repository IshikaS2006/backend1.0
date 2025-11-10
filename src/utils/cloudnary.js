import { v2 as cloudinary } from "cloudinary";
import fs, { unlink } from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error("File path is required");
        }

        if (!fs.existsSync(localFilePath)) {
            throw new Error(`Local file not found: ${localFilePath}`);
        }

        // Upload file to Cloudinary (image only)
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
        });

        console.log("File uploaded successfully to Cloudinary:", response);

        // remove local temp file after successful upload
        try {
            fs.unlinkSync(localFilePath);
        } catch (err) {
            // non-fatal
            console.warn("Failed to delete temp file:", err.message);
        }
        return response;
    } catch (error) {
        // attempt to remove local file if it exists
        try {
            if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        } catch (e) {
            // ignore
        }

        console.error("Error uploading file to Cloudinary:", error);
        throw error;
    }
};

export { uploadOnCloudinary };