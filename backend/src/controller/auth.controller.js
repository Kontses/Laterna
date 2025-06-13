import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "30d",
	});
};

export const registerUser = async (req, res, next) => {
	try {
		const { nickname, email, password, imageUrl } = req.body;

		if (!nickname || !email || !password) {
			return res.status(400).json({ message: "Please enter all required fields: nickname, email, password" });
		}

		// Check if user exists
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}

		const user = await User.create({
			nickname,
			email,
			password,
			imageUrl: imageUrl || "", // Default to empty string if not provided, rely on frontend for fallback
		});

		if (user) {
			res.status(201).json({
				_id: user._id,
				nickname: user.nickname,
				email: user.email,
				imageUrl: user.imageUrl,
				role: user.role,
				token: generateToken(user._id),
			});
		} else {
			res.status(400).json({ message: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in registerUser", error);
		next(error);
	}
};

export const loginUser = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		// Check for user email
		const user = await User.findOne({ email });

		if (user && (await user.matchPassword(password))) {
			res.status(200).json({
				_id: user._id,
				nickname: user.nickname,
				email: user.email,
				imageUrl: user.imageUrl,
				role: user.role,
				token: generateToken(user._id),
			});
		} else {
			res.status(400).json({ message: "Invalid credentials" });
		}
	} catch (error) {
		console.log("Error in loginUser", error);
		next(error);
	}
};

export const getMe = async (req, res) => {
	res.status(200).json(req.user);
};
