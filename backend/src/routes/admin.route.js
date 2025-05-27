import { Router } from "express";
import { checkAdmin, createAlbum, createSong, deleteAlbum, deleteSong, handleUpload, createArtist, getAllArtists } from "../controller/admin.controller.js"; // Import createArtist and getAllArtists
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/artists", getAllArtists); // New route to get all artists

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);

router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);

router.post("/artists", createArtist); // Add route for creating artists

// New route for combined upload
router.post("/upload", handleUpload);

export default router;
