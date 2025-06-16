import express from 'express';
import { getMessages, sendMessage } from '../controllers/chat.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/:id').get(protectRoute, getMessages);
router.route('/').post(protectRoute, sendMessage);

export default router; 