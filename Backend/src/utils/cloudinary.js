import { v2 as cloudinary } from "cloudinary";
import { api_error } from "./errorHandler.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      { folder, resource_type: "auto" }
    );
    return result.secure_url;
  } catch (err) {
    throw new api_error(500, "File upload failed. Please try again.");
  }
};

export const deleteFile = async (url) => {
  if (!url) return;
  try {
    const publicId = url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // silently fail — no need to throw on cleanup
  }
};

export default cloudinary;