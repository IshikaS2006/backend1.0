import { v2 } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) {
            throw new Error("File path is required");
        }
        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("File uploaded successfully to Cloudinary:", response);
        return response;
    }catch (error) {
        fs.unlinkSync(localFilePath); // Delete the local file after upload attempt got failed
        console.error("Error uploading file to Cloudinary:", error);
        throw error;
    }

cloudinary.v2.uploader.upload("https://wikimidia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
    { public_id: "olympic_flags" },
    function (error, result) {
        console.log(result, error);
    }
);
};
export { uploadOnCloudinary };