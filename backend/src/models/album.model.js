import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		// artist: { type: String, required: true }, // Removed artist field requirement
		artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true }, // Changed type to ObjectId and added ref
		imageUrl: { type: String, required: true },
		releaseDate: { type: Date, required: true }, // Changed to Date
		generalGenre: { type: String }, // Added generalGenre
		specificGenres: [{ type: String }], // Added specificGenres as an array of strings
		description: { type: String }, // Added description field
		songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
		// New field for additional files
		additionalFiles: [{ type: String }], // Array of strings for file URLs or public IDs
	},
	{ timestamps: true }
); //  createdAt, updatedAt

export const Album = mongoose.model("Album", albumSchema);
