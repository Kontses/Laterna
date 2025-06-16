import mongoose from 'mongoose';

const playlistSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			default: '',
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		songs: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Song',
			},
		],
		imageUrl: {
			type: String,
		},
		isPublic: {
			type: Boolean,
			default: true,
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
	},
	{
		timestamps: true,
	}
);

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist; 