import express from "express";
import {
  connectInstagramAccount,
  getInstagramProfile,
} from "../controllers/instagram.controller";
import isAuth from "../middleware/isAuth";
import { testInstagramPublish } from "../controllers/instagram-publish.controller";

const instagramRouter = express.Router();
instagramRouter.get("/profile", getInstagramProfile);
instagramRouter.post("/connect", isAuth, connectInstagramAccount);
instagramRouter.post("/test-publish", isAuth, testInstagramPublish);
export default instagramRouter;
