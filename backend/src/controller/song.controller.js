import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";

export const getAllSongs = async (req, res, next) => {
	try {
		// -1 = Descending => newest -> oldest
		// 1 = Ascending => oldest -> newest
		const songs = await Song.find().sort({ createdAt: -1 });
		console.log("Songs from DB:", songs);
		res.json(songs);
	} catch (error) {
		console.error("Error in getAllSongs:", error);
		next(error);
	}
};

export const getFeaturedSongs = async (req, res, next) => {
	try {
		// fetch 6 random songs using mongodb's aggregation pipeline
		const songs = await Song.aggregate([
			{
				$sample: { size: 6 },
			},
			{
				$project: {
					_id: 1,
					title: 1,
					artist: 1,
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getMadeForYouSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					title: 1,
					artist: 1,
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getTrendingSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					title: 1,
					artist: 1,
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const recordRecentPlay = async (req, res, next) => {
	try {
		const { id: songId } = req.params;
		const userId = req.user._id;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Remove duplicates: if songId already exists, remove it first
		user.recentPlays = user.recentPlays.filter(
			(play) => play.toString() !== songId
		);

		// Add the new songId to the beginning of the array
		user.recentPlays.unshift(songId);

		// Limit the array to a certain size (e.g., 20 recent plays)
		const MAX_RECENT_PLAYS = 20;
		if (user.recentPlays.length > MAX_RECENT_PLAYS) {
			user.recentPlays = user.recentPlays.slice(0, MAX_RECENT_PLAYS);
		}

		await user.save();

		res.status(200).json({ message: "Recent play recorded successfully" });
	} catch (error) {
		next(error);
	}
};
