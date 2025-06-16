import { Router } from "express";
import { getAllSongs, getFeaturedSongs, getMadeForYouSongs, getTrendingSongs, recordRecentPlay } from "../controller/song.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getAllSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs);
router.post("/play/:id", protectRoute, recordRecentPlay);

export default router;
