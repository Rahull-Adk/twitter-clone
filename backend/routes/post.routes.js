import express from "express";
import protectRoute from "../middleware/protectRoutes.middleware.js";
import {
  createPost,
  deletePost,
  commentOnPost,
  likeUnLikePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
} from "../controllers/post.controller.js";
const router = express.Router();

router.route("/create").post(protectRoute, createPost);
router.route("/:id").delete(protectRoute, deletePost);
router.route("/like/:id").post(protectRoute, likeUnLikePost);
router.route("/likes/:userId").get(protectRoute, getLikedPosts);
router.route("/comment/:id").post(protectRoute, commentOnPost);
router.route("/user/:username").get(protectRoute, getUserPosts);
router.route("/all").get(protectRoute, getAllPosts);
router.route("/following").get(protectRoute, getFollowingPosts);
export default router;
