import { Artist } from "../models/artist.model.js"; // Import Artist model
import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";
import { Follower } from "../models/follower.model.js";

export const getArtistData = async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = req.auth?.userId;

    // Find the artist by ID
    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).json({ message: "Artist not found." });
    }

    // Find albums by artistId
    const albums = await Album.find({ artistId: artist._id });

    // Find singles by artistId (assuming singles are songs without an albumId)
    const singles = await Song.find({ artistId: artist._id, albumId: null });

    // Check if the user is following this artist
    let isFollowing = false;
    if (userId) {
      const follower = await Follower.findOne({ userId, artistId: artist._id });
      isFollowing = !!follower;
    }

    const artistData = {
      _id: artist._id,
      name: artist.name,
      profilePhotoUrl: artist.profilePhotoUrl,
      albums: albums,
      singles: singles,
      about: artist.about || "No description available.",
      isFollowing
    };

    res.status(200).json(artistData);
  } catch (error) {
    console.error("Error fetching artist data:", error);
    res.status(500).json({ message: "Failed to fetch artist data." });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const existingFollow = await Follower.findOne({ userId, artistId });

    if (existingFollow) {
      // Unfollow
      await Follower.deleteOne({ userId, artistId });
      res.status(200).json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      // Follow
      await Follower.create({ userId, artistId });
      res.status(200).json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (error) {
    console.error("Error toggling follow status:", error);
    res.status(500).json({ message: "Failed to toggle follow status" });
  }
};
