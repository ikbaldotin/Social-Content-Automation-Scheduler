import express from "express";
import isAuth from "../middleware/isAuth";
import { schedulePost } from "../controllers/schedule.controller";

const scheduleRouter = express.Router();
scheduleRouter.patch("/:slug/posts/:id/schedule", isAuth, schedulePost);
export default scheduleRouter;
