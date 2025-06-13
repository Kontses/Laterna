import express from "express";
import dotenv from "dotenv";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Load environment variables as early as possible
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Configure Cloudinary *after* environment variables are loaded
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary API Key (from index.js):", process.env.CLOUDINARY_API_KEY); // Confirm it here

import fileUpload from "express-fileupload";
import cors from "cors";
import fs from "fs";
import { createServer } from "http";
import cron from "node-cron";

import { initializeSocket } from "./lib/socket.js";

import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import artistRoutes from "./routes/artist.route.js";
import uploadRoutes from "./routes/upload.route.js"; // Import upload routes

const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT;

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(
	cors({
		origin: ["http://localhost:3000", "https://laterna-git-master-kontses-projects.vercel.app"],
		credentials: true,
	})
);

app.use(express.json({ limit: '50mb' })); // to parse req.body with increased limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // for parsing application/x-www-form-urlencoded

app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, "tmp"),
		createParentPath: true,
		limits: {
			fileSize: 1024 * 1024 * 1024, // 1GB max file size
		},
	})
);

// cron jobs
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
	if (fs.existsSync(tempDir)) {
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("error", err);
				return;
			}
			for (const file of files) {
				fs.unlink(path.join(tempDir, file), (err) => {});
			}
		});
	}
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/upload", uploadRoutes); // Use upload routes

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
	});
}

// error handler
app.use((err, req, res, next) => {
	res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
});

httpServer.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
	connectDB();
});
