import asyncHandler from 'express-async-handler';
import Playlist from '../models/playlist.model.js';
import { Song } from '../models/song.model.js';

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
const createPlaylist = asyncHandler(async (req, res) => {
	const { name, description, isPublic, imageUrl } = req.body;

	if (!name) {
		res.status(400);
		throw new Error('Please add a name for the playlist');
	}

	const playlist = await Playlist.create({
		name,
		description,
		user: req.user.id, // User ID from auth middleware
		isPublic,
		imageUrl,
	});

	res.status(201).json(playlist);
});

// @desc    Get all playlists for the authenticated user
// @route   GET /api/playlists/me
// @access  Private
const getMyPlaylists = asyncHandler(async (req, res) => {
	const playlists = await Playlist.find({ user: req.user.id }).populate('songs').populate('user', 'nickname');
	res.status(200).json(playlists);
});

// @desc    Get a single playlist by ID
// @route   GET /api/playlists/:id
// @access  Public/Private (depending on isPublic field)
const getPlaylistById = asyncHandler(async (req, res) => {
	const playlist = await Playlist.findById(req.params.id).populate('songs').populate('user', 'nickname');

	if (!playlist) {
		res.status(404);
		throw new Error('Playlist not found');
	}

	// If playlist is private, only the owner can view it
	// if (!playlist.isPublic && playlist.user.toString() !== req.user.id) {
	// 	res.status(403);
	// 	throw new Error('Not authorized to view this playlist');
	// }

	res.status(200).json(playlist);
});

// @desc    Update a playlist
// @route   PUT /api/playlists/:id
// @access  Private
const updatePlaylist = asyncHandler(async (req, res) => {
	const { name, description, isPublic, imageUrl } = req.body;

	let playlist = await Playlist.findById(req.params.id);

	if (!playlist) {
		res.status(404);
		throw new Error('Playlist not found');
	}

	// Make sure the logged in user is the playlist owner
	if (playlist.user.toString() !== req.user.id) {
		res.status(401);
		throw new Error('User not authorized');
	}

	playlist.name = name || playlist.name;
	playlist.description = description || playlist.description;
	playlist.isPublic = isPublic !== undefined ? isPublic : playlist.isPublic;
	playlist.imageUrl = imageUrl || playlist.imageUrl;

	const updatedPlaylist = await playlist.save();
	res.status(200).json(updatedPlaylist);
});

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
// @access  Private
const deletePlaylist = asyncHandler(async (req, res) => {
	const playlist = await Playlist.findById(req.params.id);

	if (!playlist) {
		res.status(404);
		throw new Error('Playlist not found');
	}

	// Make sure the logged in user is the playlist owner
	if (playlist.user.toString() !== req.user.id) {
		res.status(401);
		throw new Error('User not authorized');
	}

	await playlist.deleteOne();
	res.status(200).json({ message: 'Playlist removed' });
});

// @desc    Add a song to a playlist
// @route   PUT /api/playlists/:id/add-song
// @access  Private
const addSongToPlaylist = asyncHandler(async (req, res) => {
	const { songId } = req.body;
	const playlist = await Playlist.findById(req.params.id);

	if (!playlist) {
		res.status(404);
		throw new Error('Playlist not found');
	}

	// Make sure the logged in user is the playlist owner
	if (playlist.user.toString() !== req.user.id) {
		res.status(401);
		throw new Error('User not authorized');
	}

	const song = await Song.findById(songId);
	if (!song) {
		res.status(404);
		throw new Error('Song not found');
	}

	// Check if song already exists in playlist
	if (playlist.songs.includes(songId)) {
		res.status(400);
		throw new Error('Song already in playlist');
	}

	playlist.songs.push(songId);
	await playlist.save();
	res.status(200).json(playlist);
});

// @desc    Remove a song from a playlist
// @route   PUT /api/playlists/:id/remove-song
// @access  Private
const removeSongFromPlaylist = asyncHandler(async (req, res) => {
	const { songId } = req.body;
	const playlist = await Playlist.findById(req.params.id);

	if (!playlist) {
		res.status(404);
		throw new Error('Playlist not found');
	}

	// Make sure the logged in user is the playlist owner
	if (playlist.user.toString() !== req.user.id) {
		res.status(401);
		throw new Error('User not authorized');
	}

	playlist.songs = playlist.songs.filter(
		(song) => song.toString() !== songId
	);
	await playlist.save();
	res.status(200).json(playlist);
});

export {
	createPlaylist,
	getMyPlaylists,
	getPlaylistById,
	updatePlaylist,
	deletePlaylist,
	addSongToPlaylist,
	removeSongFromPlaylist,
}; 