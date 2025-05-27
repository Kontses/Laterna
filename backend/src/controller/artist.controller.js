import { Artist } from "../models/artist.model.js"; // Import Artist model
import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";

export const getArtistData = async (req, res) => {
  try {
    const { artistId } = req.params;

    // Find the artist by ID
    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).json({ message: "Artist not found." });
    }

    // Find albums by artistId
    const albums = await Album.find({ artistId: artist._id });

    // Find singles by artistId (assuming singles are songs without an albumId)
    const singles = await Song.find({ artistId: artist._id, albumId: null });

    const artistData = {
      _id: artist._id,
      name: artist.name,
      profilePhotoUrl: artist.profilePhotoUrl,
      albums: albums,
      singles: singles,
      about: artist.about || "No description available." // Use artist.about, with fallback
    };

    res.status(200).json(artistData);
  } catch (error) {
    console.error("Error fetching artist data:", error);
    res.status(500).json({ message: "Failed to fetch artist data." });
  }
};
