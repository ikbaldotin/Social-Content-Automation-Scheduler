import express from "express";
import {
  login,
  logout,
  myProfile,
  register,
} from "../controllers/auth.controller";
import isAuth from "../middleware/isAuth";
const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", isAuth, myProfile);
authRouter.post("/logout", isAuth, logout);
export default authRouter;
