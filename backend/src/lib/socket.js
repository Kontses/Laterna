import { Server } from "socket.io";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js"; // Import User model

export const initializeSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: "http://localhost:3000",
			credentials: true,
		},
	});

	const userSockets = new Map(); // { userId: socketId}
	const userActivities = new Map(); // {userId: activity}

	io.on("connection", (socket) => {
		socket.on("user_connected", (userId) => {
			userSockets.set(userId, socket.id);
			userActivities.set(userId, "Idle");

			// broadcast to all connected sockets that this user just logged in
			io.emit("user_connected", userId);

			socket.emit("users_online", Array.from(userSockets.keys()));

			io.emit("activities", Array.from(userActivities.entries()));
		});

		socket.on("update_activity", ({ userId, activity }) => {
			console.log("activity updated", userId, activity);
			userActivities.set(userId, activity);
			io.emit("activity_updated", { userId, activity });
		});

		socket.on("add_to_recent_plays", async ({ userId, songId }) => {
			try {
				// 1. Remove the song if it already exists in the array
				await User.findOneAndUpdate(
					{ clerkId: userId },
					{ $pull: { recentPlays: songId } },
					{ new: true }
				);

				// 2. Add the song to the beginning of the array and limit the size
				const user = await User.findOneAndUpdate(
					{ clerkId: userId },
					{ $push: { recentPlays: { $each: [songId], $position: 0 } } },
					{ new: true }
				);

				// Although $slice can be used with $push, applying it here separately
				// ensures we limit after adding, and keeps the $push simple.
				if (user && user.recentPlays.length > 10) {
					user.recentPlays = user.recentPlays.slice(0, 10);
					await user.save();
				}

			} catch (error) {
				console.error("Error adding to recent plays:", error);
			}
		});

		socket.on("send_message", async (data) => {
			try {
				const { senderId, receiverId, content } = data;

				const message = await Message.create({
					senderId,
					receiverId,
					content,
				});

				// send to receiver in realtime, if they're online
				const receiverSocketId = userSockets.get(receiverId);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit("receive_message", message);
				}

				socket.emit("message_sent", message);
			} catch (error) {
				console.error("Message error:", error);
				socket.emit("message_error", error.message);
			}
		});

		socket.on("disconnect", () => {
			let disconnectedUserId;
			for (const [userId, socketId] of userSockets.entries()) {
				// find disconnected user
				if (socketId === socket.id) {
					disconnectedUserId = userId;
					userSockets.delete(userId);
					userActivities.delete(userId);
					break;
				}
			}
			if (disconnectedUserId) {
				io.emit("user_disconnected", disconnectedUserId);
			}
		});
	});
};
