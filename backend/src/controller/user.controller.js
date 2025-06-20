import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const currentUserId = req.user.id;
		const users = await User.find({ _id: { $ne: currentUserId } });
		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};

export const getMessages = async (req, res, next) => {
	try {
		const myId = req.user.id;
		const { userId } = req.params;

		const messages = await Message.find({
			$or: [
				{ senderId: userId, receiverId: myId },
				{ senderId: myId, receiverId: userId },
			],
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		next(error);
	}
};

export const getRecentPlays = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const user = await User.findOne({ _id: userId }).populate("recentPlays");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json(user.recentPlays.slice(0, 8));
	} catch (error) {
		next(error);
	}
};

export const updateUserProfile = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { nickname, imageUrl } = req.body;

		if (req.user.id !== id) {
			return res.status(403).json({ message: "Unauthorized" });
		}

		const user = await User.findById(id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.nickname = nickname || user.nickname;
		user.imageUrl = imageUrl || user.imageUrl;

		const updatedUser = await user.save();

		res.status(200).json(updatedUser);
	} catch (error) {
		next(error);
	}
};

export const updateUserPassword = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { password } = req.body;

		if (req.user.id !== id) {
			return res.status(403).json({ message: "Unauthorized" });
		}

		const user = await User.findById(id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// The pre-save hook in user.model.js will handle hashing the new password
		user.password = password;

		await user.save();

		res.status(200).json({ message: "Password updated successfully" });
	} catch (error) {
		next(error);
	}
};
