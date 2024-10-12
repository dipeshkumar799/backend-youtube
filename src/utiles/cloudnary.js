import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRECT,
});

// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("file is uploaded successfull", uploadResult.url);
        return uploadResult;
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed
        return null;
        console.log(error);
        console.log("file is uploaded unsuccessfull");
    }
};

export { uploadOnCloudinary };
