import express from 'express';
import {
	createPlaylist,
	getMyPlaylists,
	getPlaylistById,
	updatePlaylist,
	deletePlaylist,
	addSongToPlaylist,
	removeSongFromPlaylist,
} from '../controllers/playlist.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/').post(protectRoute, createPlaylist);
router.route('/me').get(protectRoute, getMyPlaylists);
router
	.route('/:id')
	.get(getPlaylistById)
	.put(protectRoute, updatePlaylist)
	.delete(protectRoute, deletePlaylist);
router.route('/:id/add-song').put(protectRoute, addSongToPlaylist);
router.route('/:id/remove-song').put(protectRoute, removeSongFromPlaylist);

export default router; 