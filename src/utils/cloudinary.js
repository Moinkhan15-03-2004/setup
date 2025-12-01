
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;
  try {
    // resource_type: "auto" handles images, pdfs, videos etc.
    const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
    // cleanup local file (best effort)
    fs.unlink(localFilePath, (err) => { if (err) console.warn("unlink failed:", err); });
    return response; // response.secure_url / response.url exists
  } catch (err) {
    // cleanup and log real error
    fs.unlink(localFilePath, (e) => e && console.warn("unlink failed:", e));
    console.error("Cloudinary upload failed:", err);
    return null;
  }
};
