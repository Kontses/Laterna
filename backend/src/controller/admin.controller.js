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

export const getAllArtists = async (req, res, next) => {
	try {
		const artists = await Artist.find();
		res.status(200).json(artists);
	} catch (error) {
		console.error("Error fetching artists:", error);
		next(error);
	}
};

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
		const { title, artist, releaseYear, description } = req.body;
		const { imageFile } = req.files;

		const imageUrl = await uploadToCloudinary(imageFile);

		const album = new Album({
			title,
			artist,
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
		const { albumDetails, singleSongDetails, albumSongsDetails } = req.body; // Assuming these are sent in the request body

		// Check if it's an album upload (multiple audio files) or single song upload
		if (albumSongsDetails) {
			// Album upload
			const parsedAlbumDetails = JSON.parse(albumDetails); // Parse albumDetails JSON
			const parsedAlbumSongsDetails = JSON.parse(albumSongsDetails); // Parse albumSongsDetails JSON
			console.log("Parsed albumSongsDetails:", parsedAlbumSongsDetails); // Log parsedAlbumSongsDetails

			if (!audioFiles || !imageFile || !albumDetails || !albumSongsDetails) {
				return res.status(400).json({ message: "Missing audio files, image, album details, or song details for album upload" });
			}

			// Construct the new image public ID with the desired naming convention
			const uploadDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
			const artistName = parsedAlbumDetails.artist;
			const albumTitle = parsedAlbumDetails.title;
			const newImagePublicId = `${artistName} - ${albumTitle}`;
			const albumFolder = `laterna/artists/${artistName}/${albumTitle}`;


			const imageUrl = await uploadToCloudinary(imageFile, albumFolder, newImagePublicId); // Upload image with the new public ID and folder

			let album;
			// Check if an album with the same title and artist already exists
			const existingAlbum = await Album.findOne({
				title: parsedAlbumDetails.title,
				artistId: parsedAlbumDetails.artistId, // Use artistId
			});

			if (existingAlbum) {
				console.log(`Existing album found: ${existingAlbum.title} by artist ID ${existingAlbum.artistId}. Overwriting.`);
				// If existing album found, update it
				album = existingAlbum;
				album.imageUrl = imageUrl;
				album.releaseDate = new Date(parsedAlbumDetails.releaseDate);
				album.generalGenre = parsedAlbumDetails.generalGenre;
				album.specificGenres = parsedAlbumDetails.specificGenres;
				album.description = parsedAlbumDetails.description; // Update description
				// Clear existing songs
				await Song.deleteMany({ albumId: album._id });
				album.songs = []; // Clear song references in the album
			} else {
				console.log(`No existing album found. Creating a new album: ${parsedAlbumDetails.title} with artist ID ${parsedAlbumDetails.artistId}.`);
				// If no existing album found, create a new one
				album = new Album({
					title: parsedAlbumDetails.title,
					artistId: parsedAlbumDetails.artistId, // Use artistId
					imageUrl,
					releaseDate: new Date(parsedAlbumDetails.releaseDate),
					generalGenre: parsedAlbumDetails.generalGenre,
					specificGenres: parsedAlbumSongsDetails.specificGenres, // Use specificGenres from albumSongsDetails
					description: parsedAlbumDetails.description, // Include description
				});
			}

			await album.save(); // Save the new or updated album

			const songIds = [];
			// Iterate through parsedAlbumSongsDetails to maintain order
			for (const songDetails of parsedAlbumSongsDetails) {
				// Find the corresponding audio file within the audioFiles array using md5 hash
				const audioFile = audioFiles.find(file => file.md5 === songDetails.md5);

				if (!audioFile) {
					console.error(`Audio file not found in uploaded files for song (MD5 mismatch): ${songDetails.fileName}`);
					// Depending on requirements, you might want to return an error or skip this song
					continue;
				}

				console.log("Audio file object:", audioFile); // Log the audio file object

				// Construct the song public ID with the desired naming convention
				// We might need the artist's name for the folder structure, but the song model uses artistId
				// Let's fetch the artist name using the artistId from the album
				const artist = await Artist.findById(parsedAlbumDetails.artistId);
				const artistName = artist ? artist.name : 'Unknown Artist'; // Fallback if artist not found

				const songTitle = songDetails.title;
				// Assuming trackNumber is available in songDetails if needed for public ID
				const newSongPublicId = songDetails.trackNumber ? `${songDetails.trackNumber}) ${songTitle}` : songTitle;

				// Use the album folder structure for songs within an album
				const songFolder = `laterna/artists/${artistName}/${parsedAlbumDetails.title}`;


				const audioUrl = await uploadToCloudinary(audioFile, songFolder, newSongPublicId, "video"); // Upload audio with the album folder, public ID, and resourceType "video"
				console.log(`Processing song:`, songDetails); // Log song details
				console.log(`Song title: ${songDetails.title}`); // Log song title


				const song = new Song({
					title: songDetails.title, // Use the original song title
					artist: artistName, // Store artist name in song model for easier access
					artistId: parsedAlbumDetails.artistId, // Store artistId in song model
					audioUrl, // audioUrl already includes the public ID from uploadToCloudary
					imageUrl, // Using album image for songs in album
					duration: 0, // TODO: Get actual duration
					albumId: album._id,
					generalGenre: parsedAlbumDetails.generalGenre, // Include generalGenre for songs
					specificGenres: parsedAlbumDetails.specificGenres, // Include specificGenres for songs
				});

				await song.save();
				songIds.push(song._id);
			}

			// Update album with song IDs
			album.songs = songIds;
			await album.save();

			res.status(201).json(album);

		} else if (singleSongDetails) {
			// Single audio file upload
			if (!imageFile || !singleSongDetails) {
				return res.status(400).json({ message: "Missing image or song details for single song upload" });
			}

			const parsedSingleSongDetails = JSON.parse(singleSongDetails); // Parse singleSongDetails JSON

			// Find the single audio file in req.files. Assuming the frontend sends it with a specific key or the only file
			// A more robust approach would be to send the single audio file with a known key from the frontend
			// For now, let's assume it's the only file in req.files besides the imageFile
			const audioFileKey = Object.keys(req.files).find(key => key !== 'imageFile');
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
			const artistName = artist ? artist.name : 'Unknown Artist'; // Fallback if artist not found


			// Construct the new image public ID with the desired naming convention for single songs
			const songTitle = parsedSingleSongDetails.title;
			const newImagePublicId = `${artistName} - ${songTitle}`;
			const artistFolder = `laterna/artists/${artistName}`;


			const imageUrl = await uploadToCloudinary(imageFile, artistFolder, newImagePublicId); // Upload image with the new public ID and folder

			// Construct the new song public ID with the desired naming convention for single songs
			const newSongPublicId = `${songTitle}`; // Assuming no track number for single songs

			const audioUrl = await uploadToCloudinary(audioFile, artistFolder, newSongPublicId, "video"); // audioFile is a single file here, upload with artist folder and public ID, and resourceType "video"

			const song = new Song({
				title: parsedSingleSongDetails.title, // Use the original song title from singleSongDetails
				artist: artistName, // Store artist name
				artistId: artistId, // Store artistId
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
