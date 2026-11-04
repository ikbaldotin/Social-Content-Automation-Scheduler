import express from "express";
import isAuth from "../middleware/isAuth";
import {
  addMember,
  getAllMembers,
  removeMember,
  updateMemberRole,
} from "../controllers/membership.controller";
const membershipRouter = express.Router();
membershipRouter.post("/:slug/members", isAuth, addMember);

membershipRouter.get("/:slug/members", isAuth, getAllMembers);

membershipRouter.patch("/:slug/members/:userId", isAuth, updateMemberRole);

membershipRouter.delete("/:slug/members/:userId", isAuth, removeMember);
export default membershipRouter;
