import express from "express";
import {
  getUserProfile,
  followUnFollowUser,
  getSuggestedUser,
  updateUserProfile,
} from "../controllers/user.controller.js";
import protectRoute from "../middleware/protectRoutes.middleware.js";
const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUser);
router.post("/follow/:id", protectRoute, followUnFollowUser);
router.post("/update", protectRoute, updateUserProfile);

export default router;
