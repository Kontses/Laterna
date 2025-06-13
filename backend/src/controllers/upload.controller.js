import { cloudinary } from '../lib/cloudinary.js';
import asyncHandler from 'express-async-handler';

// @desc    Upload image to Cloudinary
// @route   POST /api/upload/image
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).json({ message: 'No files were uploaded.' });
        return;
    }

    const file = req.files.image;

    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'laterna', // Folder in Cloudinary
        });
        res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ message: 'Image upload failed', error: error.message });
    }
});

export { uploadImage }; 