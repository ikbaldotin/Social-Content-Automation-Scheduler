import express from "express";
import isAuth from "../middleware/isAuth";
import {
  cancelScheduledPost,
  reschedulePost,
  schedulePost,
} from "../controllers/schedule.controller";

const scheduleRouter = express.Router();
scheduleRouter.patch("/:slug/posts/:id/schedule", isAuth, schedulePost);
scheduleRouter.patch("/:slug/posts/:id/cancel", isAuth, cancelScheduledPost);
scheduleRouter.patch("/:slug/posts/:id/reschedule", isAuth, reschedulePost);
export default scheduleRouter;
