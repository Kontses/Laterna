import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";

export const getArtistData = async (req, res) => {
  try {
    const { artistId } = req.params;

    // Find albums by artistId
    const albums = await Album.find({ artistId });

    // Find singles by artistId (assuming singles are songs without an albumId)
    const singles = await Song.find({ artistId, albumId: null });

    // Assuming artist name and image can be taken from the first album or single
    let artistName = "Unknown Artist";
    let profilePhotoUrl = "";

    if (albums.length > 0) {
      artistName = albums[0].artist;
      // Assuming coverUrl of the first album can be used as profile photo
      profilePhotoUrl = albums[0].coverUrl;
    } else if (singles.length > 0) {
      artistName = singles[0].artist;
      // Assuming imageUrl of the first single can be used as profile photo
      profilePhotoUrl = singles[0].imageUrl;
    }

    const artistData = {
      _id: artistId,
      name: artistName,
      profilePhotoUrl: profilePhotoUrl,
      albums: albums,
      singles: singles,
      // TODO: Fetch actual artist description if available
      about: "No description available."
    };

    res.status(200).json(artistData);
  } catch (error) {
    console.error("Error fetching artist data:", error);
    res.status(500).json({ message: "Failed to fetch artist data." });
  }
};
