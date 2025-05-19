import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true, // Artist names should likely be unique
		},
		profilePhotoUrl: {
			type: String,
			required: false, // Profile photo might be optional initially
		},
		about: {
			type: String,
			required: false, // Description might be optional
		},
	},
	{ timestamps: true } // createdAt, updatedAt
);

export const Artist = mongoose.model("Artist", artistSchema);
