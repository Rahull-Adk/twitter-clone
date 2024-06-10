import express from "express";
import protectRoutes from "../middleware/protectRoutes.middleware.js";
import {
  signup,
  login,
  logout,
  getUser,
} from "../controllers/auth.controller.js";
const router = express.Router();
router.get("/user", protectRoutes, getUser);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
