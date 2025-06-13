import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, getMessages, getRecentPlays, updateUserProfile, updateUserPassword } from "../controller/user.controller.js";
const router = Router();

router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);
router.get("/recent-plays", protectRoute, getRecentPlays);
router.put("/:id", protectRoute, updateUserProfile);
router.put("/:id/password", protectRoute, updateUserPassword);

export default router;
