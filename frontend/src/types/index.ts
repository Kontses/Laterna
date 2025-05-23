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
	artistId: string;
	coverUrl: string;
	imageUrl: string;
	year: number;
	type: string; // e.g., "Album", "EP"
	description?: string;
	songs: Song[];
}

export interface Single {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string; // Changed from coverUrl to imageUrl
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
}
