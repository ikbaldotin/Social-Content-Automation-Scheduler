import express from "express";
import isAuth from "../middleware/isAuth";
import uploadMedia from "../middleware/upload";
import {
  deletePostMedia,
  getPostMedia,
  uploadPostMedia,
} from "../controllers/media.controller";

const mediaRouter = express.Router();
mediaRouter.post(
  "/:slug/posts/:id/media",
  isAuth,
  uploadMedia,
  uploadPostMedia,
);

mediaRouter.get("/:slug/posts/:id/media", isAuth, getPostMedia);

mediaRouter.delete("/:slug/posts/:id/media/:mediaId", isAuth, deletePostMedia);
export default mediaRouter;
