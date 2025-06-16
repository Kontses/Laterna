import { create } from 'zustand';
import axios from 'axios';
import { Playlist } from '@/types';

interface PlaylistStore {
	playlists: Playlist[];
	isLoading: boolean;
	error: string | null;
	fetchPlaylists: () => Promise<void>;
	createPlaylist: (name: string, description?: string, imageUrl?: string, isPublic?: boolean) => Promise<Playlist | undefined>;
	addSongToPlaylist: (playlistId: string, songId: string) => Promise<Playlist | undefined>;
	removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<Playlist | undefined>;
	updatePlaylist: (playlistId: string, data: Partial<Playlist>) => Promise<Playlist | undefined>;
	deletePlaylist: (playlistId: string) => Promise<boolean>;
}

export const usePlaylistStore = create<PlaylistStore>((set) => ({
	playlists: [],
	isLoading: false,
	error: null,

	fetchPlaylists: async () => {
		set({ isLoading: true, error: null });
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				set({ error: 'No authentication token found.', isLoading: false });
				return;
			}
			const response = await axios.get('/api/playlists/me', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			console.log("API response data for playlists:", response.data);
			console.log("Type of response.data:", typeof response.data);
			console.log("Is response.data an array:", Array.isArray(response.data));
			set({ playlists: response.data, isLoading: false });
		} catch (err: any) {
			console.error("Error fetching playlists:", err);
			set({ error: err.response?.data?.message || 'Failed to fetch playlists', isLoading: false });
		}
	},

	createPlaylist: async (name, description, imageUrl, isPublic) => {
		set({ isLoading: true, error: null });
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				set({ error: 'No authentication token found.', isLoading: false });
				return;
			}
			const response = await axios.post('/api/playlists', { name, description, imageUrl, isPublic }, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			set((state) => ({
				playlists: [...state.playlists, response.data],
				isLoading: false,
			}));
			return response.data;
		} catch (err: any) {
			set({ error: err.response?.data?.message || 'Failed to create playlist', isLoading: false });
		}
		return undefined;
	},

	addSongToPlaylist: async (playlistId, songId) => {
		set({ isLoading: true, error: null });
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				set({ error: 'No authentication token found.', isLoading: false });
				return;
			}
			const response = await axios.put(`/api/playlists/${playlistId}/add-song`, { songId }, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			set((state) => ({
				playlists: state.playlists.map((p) => (p._id === playlistId ? response.data : p)),
				isLoading: false,
			}));
			return response.data;
		} catch (err: any) {
			set({ error: err.response?.data?.message || 'Failed to add song to playlist', isLoading: false });
		}
		return undefined;
	},

	removeSongFromPlaylist: async (playlistId, songId) => {
		set({ isLoading: true, error: null });
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				set({ error: 'No authentication token found.', isLoading: false });
				return;
			}
			const response = await axios.put(`/api/playlists/${playlistId}/remove-song`, { songId }, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			set((state) => ({
				playlists: state.playlists.map((p) => (p._id === playlistId ? response.data : p)),
				isLoading: false,
			}));
			return response.data;
		} catch (err: any) {
			set({ error: err.response?.data?.message || 'Failed to remove song from playlist', isLoading: false });
		}
		return undefined;
	},

	updatePlaylist: async (playlistId, data) => {
		set({ isLoading: true, error: null });
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				set({ error: 'No authentication token found.', isLoading: false });
				return;
			}
			const response = await axios.put(`/api/playlists/${playlistId}`, data, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			set((state) => ({
				playlists: state.playlists.map((p) => (p._id === playlistId ? response.data : p)),
				isLoading: false,
			}));
			return response.data;
		} catch (err: any) {
			set({ error: err.response?.data?.message || 'Failed to update playlist', isLoading: false });
		}
		return undefined;
	},

	deletePlaylist: async (playlistId) => {
		set({ isLoading: true, error: null });
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				set({ error: 'No authentication token found.', isLoading: false });
				return false;
			}
			await axios.delete(`/api/playlists/${playlistId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			set((state) => ({
				playlists: state.playlists.filter((p) => p._id !== playlistId),
				isLoading: false,
			}));
			return true;
		} catch (err: any) {
			set({ error: err.response?.data?.message || 'Failed to delete playlist', isLoading: false });
			return false;
		}
	},
}));