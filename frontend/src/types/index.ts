export interface Song {
	_id: string;
	title: string;
	artist: string;
	artistId: string;
	albumId: string | null;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	createdAt: string;
	updatedAt: string;
	playlistId?: string;
}

export interface Album {
	_id: string;
	title: string;
	artistId: string | Artist;
	imageUrl: string;
	releaseDate: string;
	type: string; // e.g., "Album", "EP"
	description?: string;
	songs: Song[];
	additionalFiles?: MediaItem[]; // Added for additional photos/files in albums
}

export interface Single {
	_id: string;
	title: string;
	artist: string;
	artistId: string; // Added for compatibility with Song
	albumId: string | null; // Added for compatibility with Song
	imageUrl: string; // Changed from coverUrl to imageUrl
	audioUrl: string; // Added for compatibility with Song
	year: number;
	type: string; // e.g., "Single"
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	_id: string;
	nickname: string;
	imageUrl: string;
	email: string;
	role: "user" | "admin";
}

export interface Artist {
	_id: string;
	name: string;
	albums: Album[];
	singles: Single[];
	about: string;
	profilePhotoUrl: string;
	galleryImages?: string[]; // Added for gallery
	photos?: MediaItem[]; // Added for uploaded photos
	musicVideos?: MediaItem[]; // Added for music videos
}

export interface MediaItem {
	_id: string;
	url: string;
	name?: string;
	description?: string;
	// Add other fields if necessary, like file type (image/video)
}

export type RecentPlay = {
	_id: string;
	user: string;
	song: Song;
	playedAt: string;
};

export type Chat = {
	_id: string;
	participants: User[];
	lastMessage?: Message;
	createdAt: string;
	updatedAt: string;
};

export type Playlist = {
	_id: string;
	name: string;
	description?: string;
	user: User; // The user who created the playlist
	songs: Song[];
	imageUrl?: string;
	isPublic: boolean;
	likes: string[]; // Array of User IDs who liked the playlist
	createdAt: string;
	updatedAt: string;
};
