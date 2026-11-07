import { NextFunction, Request, Response } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

const uploadMedia = (req: Request, res: Response, next: NextFunction) => {
  upload.single("media")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "File size must not exceed 5 MB"
            : error.message,
      });
    }
    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    next();
  });
};

export default uploadMedia;
