import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth.route";
import wokspaceRouter from "./routers/workspace.route";
import membershipRouter from "./routers/membership.route";
import socialAccountRouter from "./routers/social-account.route";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT;
app.use("/api/auth", authRouter);
app.use("/api/workspace", wokspaceRouter);
app.use("/api/membership", membershipRouter);
app.use("/api/social", socialAccountRouter);
app.listen(port, () => {
  console.log(`Sever is running on port ${port}`);
});
