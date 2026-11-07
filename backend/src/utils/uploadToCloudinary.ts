import cloudinary from "../config/cloudinary";
import { Readable } from "stream";
const uploadToCloudinary = async (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "social-scheduler",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary returned no result"));
        }
        resolve(result);
      },
    );
    Readable.from(buffer).pipe(stream);
  });
};

export default uploadToCloudinary;
