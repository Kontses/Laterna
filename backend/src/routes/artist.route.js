import { Router } from "express";
import { getArtistData, toggleFollow } from "../controller/artist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:artistId", getArtistData);
router.post("/:artistId/toggle-follow", protectRoute, toggleFollow);
router.delete("/:artistId/toggle-follow", protectRoute, toggleFollow);

export default router;
