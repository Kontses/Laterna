import { v2 as cloudinary } from "cloudinary";

// No dotenv import
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Removed Cloudinary config from here. It will be configured in index.js
// console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY); // Removed

// cloudinary.config({
// 	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// 	api_key: process.env.CLOUDINARY_API_KEY,
// 	api_secret: process.env.CLOUDINARY_API_SECRET,
// });

export { cloudinary };
