import { Router } from "express";
import { checkAdmin, createAlbum, createSong, deleteAlbum, deleteSong, handleUpload, createArtist, handleMediaUpload } from "../controller/admin.controller.js"; // Import handleMediaUpload
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);

router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);

router.post("/artists", createArtist); // Add route for creating artists

// New route for combined upload
router.post("/upload", handleUpload);

// New route for media upload - Assuming a controller function will be added for this
router.post("/upload-media", handleMediaUpload); // Placeholder for new media upload controller

export default router;
