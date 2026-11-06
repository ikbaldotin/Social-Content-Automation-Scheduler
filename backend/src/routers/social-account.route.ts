import express from "express";
import isAuth from "../middleware/isAuth";
import {
  createSocialAccount,
  disconnectSocialAccount,
  getAllSocialAccounts,
  getSocialAccountById,
  updateSocialAccount,
} from "../controllers/social-account.controller";
const socialAccountRouter = express.Router();

socialAccountRouter.post("/:slug/social-accounts", isAuth, createSocialAccount);

socialAccountRouter.get("/:slug/social-accounts", isAuth, getAllSocialAccounts);

socialAccountRouter.get(
  "/:slug/social-accounts/:id",
  isAuth,
  getSocialAccountById,
);

socialAccountRouter.patch(
  "/:slug/social-accounts/:id",
  isAuth,
  updateSocialAccount,
);

socialAccountRouter.delete(
  "/:slug/social-accounts/:id",
  isAuth,
  disconnectSocialAccount,
);
export default socialAccountRouter;
