import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		nickname: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
			required: false,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		recentPlays: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Song",
			},
		],
	},
	{ timestamps: true } //  createdAt, updatedAt
);

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
