import express from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/image', protectRoute, uploadImage);

export default router; 