import { Router } from "express";
import { getArtistData } from "../controller/artist.controller.js";

const router = Router();

router.get("/:artistId", getArtistData);

export default router;
