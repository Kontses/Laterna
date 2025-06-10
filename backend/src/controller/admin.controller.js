import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

// helper function for cloudinary uploads
const uploadToCloudinary = async (file, folder, publicId = null, resourceType = "auto") => {
	try {
		const options = {
			resource_type: resourceType, // Use the resourceType parameter here
			folder: folder, // Add the folder parameter here
		};
		if (publicId) {
			options.public_id = publicId;
		}
		const result = await cloudinary.uploader.upload(file.tempFilePath, options);
		return result.secure_url;
	} catch (error) {
		console.log("Error in uploadToCloudinary", error);
		throw new Error("Error uploading to cloudinary");
	}
};

import { Artist } from "../models/artist.model.js"; // Import Artist model

export const createArtist = async (req, res, next) => {
	try {
		const { name, about } = req.body;
		const profilePhotoFile = req.files?.profilePhoto; // Get the uploaded file

		let profilePhotoUrl = "";
		if (profilePhotoFile) {
			const artistName = name;
			const folder = `laterna/artists/${artistName}`; // Changed folder path to laterna/artists
			const publicId = `${artistName} - profile pic`;
			// Upload photo to Cloudinary
			profilePhotoUrl = await uploadToCloudinary(profilePhotoFile, folder, publicId);
		}

		const artist = new Artist({
			name,
			profilePhotoUrl,
			about,
		});

		await artist.save();

		res.status(201).json(artist);
	} catch (error) {
		console.error("Error creating artist:", error);
		next(error);
	}
};

export const createSong = async (req, res, next) => {
	try {
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload all files" });
		}

		const { title, artist, albumId, duration } = req.body;
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		const audioUrl = await uploadToCloudinary(audioFile);
		const imageUrl = await uploadToCloudinary(imageFile);

		const song = new Song({
			title,
			artist,
			audioUrl,
			imageUrl,
			duration,
			albumId: albumId || null,
		});

		await song.save();

		// if song belongs to an album, update the album's songs array
		if (albumId) {
			await Album.findByIdAndUpdate(albumId, {
				$push: { songs: song._id },
			});
		}
		res.status(201).json(song);
	} catch (error) {
		console.log("Error in createSong", error);
		next(error);
	}
};

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;

		const song = await Song.findById(id);

		// if song belongs to an album, update the album's songs array
		if (song.albumId) {
			await Album.findByIdAndUpdate(song.albumId, {
				$pull: { songs: song._id },
			});
		}

		await Song.findByIdAndDelete(id);

		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleteSong", error);
		next(error);
	}
};

export const createAlbum = async (req, res, next) => {
	try {
		const { title, artistId, releaseYear, description } = req.body; // Changed 'artist' to 'artistId'
		const { imageFile } = req.files;

		// Fetch artist name using artistId for Cloudinary folder path
		const artist = await Artist.findById(artistId);
		const artistName = artist ? artist.name : 'unknown_artist'; // Fallback to a valid folder name

		// Construct Cloudinary folder path
		const albumFolder = `laterna/artists/${artistName}/${title}`;
		const imageUrl = await uploadToCloudinary(imageFile, albumFolder); // Pass folder to uploadToCloudinary

		const album = new Album({
			title,
			artistId, // Use artistId
			imageUrl,
			releaseYear,
			description,
		});

		await album.save();

		res.status(201).json(album);
	} catch (error) {
		console.log("Error in createAlbum", error);
		next(error);
	}
};

export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		await Song.deleteMany({ albumId: id });
		await Album.findByIdAndDelete(id);
		res.status(200).json({ message: "Album deleted successfully" });
	} catch (error) {
		console.log("Error in deleteAlbum", error);
		next(error);
	}
};

export const checkAdmin = async (req, res, next) => {
	res.status(200).json({ admin: true });
};

export const handleUpload = async (req, res, next) => {
	try {
		console.log("req.files:", req.files); // Log the req.files object
		const audioFiles = req.files?.audioFiles; // Get the array of audio files
		const imageFile = req.files?.imageFile; // Assuming image file is sent under the key 'imageFile'
		// Get additional album files
		const additionalAlbumFiles = req.files?.additionalAlbumFiles; // Get the array of additional files

		const { albumDetails, singleSongDetails, albumSongsDetails, additionalAlbumFileNames } = req.body; // Get additionalAlbumFileNames from req.body

		// Check if it's an album upload (multiple audio files) or single song upload
		if (albumSongsDetails) {
			// Album upload
			const parsedAlbumDetails = JSON.parse(albumDetails);
			const parsedAlbumSongsDetails = JSON.parse(albumSongsDetails);
			console.log("Parsed albumSongsDetails:", parsedAlbumSongsDetails);
			const parsedAdditionalAlbumFileNames = additionalAlbumFileNames ? JSON.parse(additionalAlbumFileNames) : []; // Parse additionalAlbumFileNames if they exist

			if (!audioFiles || !imageFile || !albumDetails || !albumSongsDetails) {
				return res.status(400).json({ message: "Missing required files or details for album upload" });
			}

			const artist = await Artist.findById(parsedAlbumDetails.artistId);
			const artistName = artist ? artist.name.trim() : 'unknown_artist';
			const albumTitle = parsedAlbumDetails.title.trim();

			// Construct the base folder path for the album
			const albumFolderPath = `laterna/artists/${artistName}/${albumTitle}`;

			// Upload album image
			const imagePublicId = `${artistName} - ${albumTitle}`; // Public ID for the album image
			const imageUrl = await uploadToCloudinary(imageFile, albumFolderPath, imagePublicId); // Pass folder and publicId

			let album;
			// Check if an album with the same title and artist already exists
			const existingAlbum = await Album.findOne({
				title: parsedAlbumDetails.title,
				artistId: parsedAlbumDetails.artistId,
			});

			if (existingAlbum) {
				console.log(`Existing album found: ${existingAlbum.title} by artist ID ${existingAlbum.artistId}. Overwriting.`);
				// If existing album found, update it
				album = existingAlbum;
				album.imageUrl = imageUrl;
				album.releaseDate = new Date(parsedAlbumDetails.releaseDate);
				album.generalGenre = parsedAlbumDetails.generalGenre;
				album.specificGenres = parsedAlbumDetails.specificGenres;
				album.description = parsedAlbumDetails.description;
				// Clear existing songs and additional files if overwriting
				await Song.deleteMany({ albumId: album._id });
				album.songs = [];
				album.additionalFiles = []; // Clear existing additional files
			} else {
				console.log(`No existing album found. Creating a new album: ${parsedAlbumDetails.title} with artist ID ${parsedAlbumDetails.artistId}.`);
				// If no existing album found, create a new one
				album = new Album({
					title: parsedAlbumDetails.title,
					artistId: parsedAlbumDetails.artistId,
					imageUrl,
					releaseDate: new Date(parsedAlbumDetails.releaseDate),
					generalGenre: parsedAlbumDetails.generalGenre,
					specificGenres: parsedAlbumDetails.specificGenres, // Corrected to use albumDetails specific genres
					description: parsedAlbumDetails.description,
				});
			}

			// Upload audio files and create Song documents
			const uploadedSongs = [];
			// Iterate through parsedAlbumSongsDetails to maintain the order
			for (let i = 0; i < parsedAlbumSongsDetails.length; i++) {
				const songDetails = parsedAlbumSongsDetails[i];
				console.log("Processing song details:", songDetails); // Log the song details

				// Find the corresponding audio file in req.files.audioFiles using the md5 hash
				const audioFile = audioFiles.find(file => file.md5 === songDetails.md5); // Match using md5 hash

				if (!audioFile) {
					console.warn(`Could not find audio file with md5: ${songDetails.md5}. Skipping song details.`);
					continue; // Skip this song detail if the file is not found
				}

				// Construct the public ID for the audio file
				const audioPublicId = `${artistName} - ${albumTitle} - ${songDetails.title}`; // Public ID using song title

				// Upload audio file to Cloudinary
				const audioUrl = await uploadToCloudinary(audioFile, albumFolderPath, audioPublicId, 'video'); // Use 'video' for audio resources and pass folder/publicId

				// Create a new Song document
				const newSong = new Song({
					title: songDetails.title,
					artist: artistName,
					artistId: parsedAlbumDetails.artistId,
					audioUrl,
					imageUrl: album.imageUrl, // Use album image as song image
					duration: songDetails.duration,
					albumId: album._id,
					md5Hash: songDetails.md5, // Store MD5 hash
					order: i, // Store the order of the song
				});

				await newSong.save();
				uploadedSongs.push(newSong._id); // Store the ID of the saved song
			}

			// Add uploaded song IDs to the album's songs array
			album.songs = uploadedSongs;

			// Upload additional album files if they exist
			const additionalFileUrls = [];
			if (additionalAlbumFiles && Array.isArray(additionalAlbumFiles)) {
				const additionalFilesFolderPath = `${albumFolderPath}/additional`; // Subfolder for additional files
				for (let i = 0; i < additionalAlbumFiles.length; i++) { // Use index for matching with file names
					const file = additionalAlbumFiles[i];
					const originalFileName = parsedAdditionalAlbumFileNames[i] || file.name; // Get original file name from the parsed list or fallback to file.name

					const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw';

					// Construct a public ID for the additional file using the originalFileName
					const additionalFilePublicId = `${artistName} - ${albumTitle} - ${originalFileName.replace(/\.[^/.]+$/, "")}`; // Use originalFileName for file name

					const fileUrl = await uploadToCloudinary(file, additionalFilesFolderPath, additionalFilePublicId, resourceType); // Pass folder and publicId
					additionalFileUrls.push(fileUrl);
				}
			}
			album.additionalFiles = additionalFileUrls;

			await album.save();

			res.status(201).json(album); // Respond with the created/updated album

		} else if (singleSongDetails) {
			// Single song upload
			const parsedSingleSongDetails = JSON.parse(singleSongDetails);

			if (!imageFile || !singleSongDetails) {
				return res.status(400).json({ message: "Missing image or song details for single song upload" });
			}

			// Find the single audio file in req.files. Assuming the frontend sends it with a specific key or the only file
			// A more robust approach would be to send the single audio file with a known key from the frontend
			// For now, let's assume it's the only file in req.files besides the imageFile
			const audioFileKey = Object.keys(req.files).find(key => key !== 'imageFile' && key !== 'additionalAlbumFiles'); // Exclude additionalAlbumFiles here too
			const audioFile = audioFileKey ? req.files[audioFileKey] : null;

			if (!audioFile) {
				return res.status(400).json({ message: "No audio file uploaded for single song" });
			}

			// For single songs, we still need the artistId. The frontend currently sends artist name.
			// We need to find the artist by name or require artistId from the frontend for single songs too.
			// For now, let's assume the frontend will be updated to send artistId for single songs as well.
			// If not, we would need to add logic here to find the artist by name.
			// Assuming frontend will send artistId for single songs:
			const artistId = parsedSingleSongDetails.artistId; // Assuming artistId is sent for single songs
			const artist = await Artist.findById(artistId);
			const artistName = artist ? artist.name : 'unknown_artist';

			// Construct the new image public ID with the desired naming convention for single songs
			const songTitle = parsedSingleSongDetails.title;
			const newImagePublicId = `laterna/artists/${artistName}/${songTitle}`; // Full path as public ID
			const imageUrl = await uploadToCloudinary(imageFile, null, newImagePublicId); // Pass null for folder

			// Construct the new song public ID with the desired naming convention for single songs
			const newSongPublicId = `laterna/artists/${artistName}/${songTitle}`; // Full path as public ID

			const audioUrl = await uploadToCloudinary(audioFile, null, newSongPublicId, "video");

			const song = new Song({
				title: parsedSingleSongDetails.title,
				artist: artistName,
				artistId: artistId,
				audioUrl,
				imageUrl,
				duration: 0, // TODO: Get actual duration
				albumId: null,
			});

			await song.save();

			res.status(201).json(song);

		} else {
			// Neither album nor single song details provided
			return res.status(400).json({ message: "Invalid upload request: Missing album or single song details" });
		}

	} catch (error) {
		console.log("Error in handleUpload", error);
		next(error);
	}
};

export const handleMediaUpload = async (req, res, next) => {
	try {
		console.log("req.files for media upload:", req.files);
		const mediaFile = req.files?.mediaFile;
		const { artistId, name, description } = req.body;

		if (!mediaFile) {
			return res.status(400).json({ message: "No media file uploaded" });
		}
		if (!artistId || !name) {
			return res.status(400).json({ message: "Missing artist ID or media name" });
		}

		const artist = await Artist.findById(artistId);
		const artistName = artist ? artist.name : 'unknown_artist';

		const resourceType = mediaFile.mimetype.startsWith('video') ? 'video' : 'image';

		const folder = `laterna/artists/${artistName}/media`;
		const publicId = `${artistName} - ${name}`;

		const mediaUrl = await uploadToCloudinary(mediaFile, folder, publicId, resourceType);

		// TODO: Save media details to the database (requires a Media model)

		res.status(201).json({ message: "Media uploaded successfully!", url: mediaUrl });

	} catch (error) {
		console.log("Error in handleMediaUpload", error);
		next(error);
	}
};
