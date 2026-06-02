import { v2 as cloudinary } from "cloudinary";

function initCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error(
      "Missing Cloudinary configuration. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return cloudinary;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

export async function uploadResumeToCloudinary(
  fileUrl: string,
  fileName: string
): Promise<CloudinaryUploadResult> {
  const cloud = initCloudinary();
  const publicId = `resume-lens-ai/${fileName.replace(/\.[^/.]+$/, "")}-${Date.now()}`;

  return new Promise((resolve, reject) => {
    cloud.uploader.upload(
      fileUrl,
      {
        resource_type: "raw",
        folder: "resume-lens-ai",
        public_id: publicId,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result || !result.secure_url || !result.public_id) {
          return reject(new Error("Unexpected Cloudinary response while uploading resume."));
        }

        return resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
  });
}
