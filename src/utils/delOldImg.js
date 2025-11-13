//when new avatar or cover image is uploaded delete old one from cloudinary
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
const delOldImg = async (imageUrl) => {
    try {
        if (!imageUrl) {
            console.warn("No image URL provided for deletion.");
            return;
        }
        // Extract public ID from the URL
        const urlParts = imageUrl.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split(".")[0];
        // Delete image from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`Image deleted from Cloudinary: ${publicId}`, result);
    }
    catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
    }
};

export default delOldImg;