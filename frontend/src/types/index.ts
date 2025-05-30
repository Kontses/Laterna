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
	clerkId: string;
	fullName: string;
	imageUrl: string;
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
