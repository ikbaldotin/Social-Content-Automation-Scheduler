import express from "express";
import isAuth from "../middleware/isAuth";
import {
  cancelScheduledPost,
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
} from "../controllers/post.controller";
const postRouter = express.Router();
postRouter.post("/:slug/posts", isAuth, createPost);
postRouter.get("/:slug/posts", isAuth, getAllPosts);
postRouter.get("/:slug/posts/:id", isAuth, getPostById);

postRouter.patch("/:slug/posts/:id", isAuth, updatePost);
postRouter.delete("/:slug/posts/:id", isAuth, deletePost);

postRouter.patch("/:slug/posts/:id/cancel", isAuth, cancelScheduledPost);
export default postRouter;
