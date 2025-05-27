import mongoose from "mongoose";

const followerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: true,
    }
  },
  { timestamps: true }
);

// Create a compound index to ensure a user can only follow an artist once
followerSchema.index({ userId: 1, artistId: 1 }, { unique: true });

export const Follower = mongoose.model("Follower", followerSchema); 