import { create } from "zustand";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";
import { arrayMove } from '@dnd-kit/sortable'; // Import arrayMove from dnd-kit

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;
	audioElement: HTMLAudioElement | null; // New property for audio element

	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playNext: () => void;
	playPrevious: () => void;
	setAudioElement: (audio: HTMLAudioElement | null) => void; // New function to set audio element
	addSongToQueue: (song: Song) => void; // Add new function to interface
	removeSongFromQueue: (songId: string) => void; // Add new function to interface
	reorderQueue: (oldIndex: number, newIndex: number) => void; // Add new function for reordering
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,
	audioElement: null, // Initialize audio element

	initializeQueue: (songs: Song[]) => {
		set({
			queue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;

		const song = songs[startIndex];

		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
			socket.emit("add_to_recent_plays", {
				userId: socket.auth.userId,
				songId: song._id,
			});
		}
		set({
			queue: songs,
			currentSong: song,
			currentIndex: startIndex,
			isPlaying: true,
		});
		get().audioElement?.play(); // Play the song
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;

		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
			socket.emit("add_to_recent_plays", {
				userId: socket.auth.userId,
				songId: song._id,
			});
		}

		const songIndex = get().queue.findIndex((s) => s._id === song._id);
		set({
			currentSong: song,
			isPlaying: true,
			currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
		});
		get().audioElement?.play(); // Play the song
	},

	togglePlay: () => {
		const willStartPlaying = !get().isPlaying;
		const audioElement = get().audioElement;

		if (willStartPlaying) {
			audioElement?.play();
		} else {
			audioElement?.pause();
		}

		const currentSong = get().currentSong;
		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity:
					willStartPlaying && currentSong ? `Playing ${currentSong.title} by ${currentSong.artist}` : "Idle",
			});
			if (willStartPlaying && currentSong) {
				socket.emit("add_to_recent_plays", {
					userId: socket.auth.userId,
					songId: currentSong._id,
				});
			}
		}

		set({
			isPlaying: willStartPlaying,
		});
	},

	playNext: () => {
		const { currentIndex, queue } = get();
		const nextIndex = currentIndex + 1;

		// if there is a next song to play, let's play it
		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${nextSong.title} by ${nextSong.artist}`,
				});
				socket.emit("add_to_recent_plays", {
					userId: socket.auth.userId,
					songId: nextSong._id,
				});
			}

			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
			});
			get().audioElement?.play(); // Play the song
		} else {
			// no next song
			set({ isPlaying: false });
			get().audioElement?.pause(); // Pause if no next song

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Idle`,
				});
			}
		}
	},
	playPrevious: () => {
		const { currentIndex, queue } = get();
		const prevIndex = currentIndex - 1;

		// theres a prev song
		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${prevSong.title} by ${prevSong.artist}`,
				});
				socket.emit("add_to_recent_plays", {
					userId: socket.auth.userId,
					songId: prevSong._id,
				});
			}

			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
			get().audioElement?.play(); // Play the song
		} else {
			// no prev song
			set({ isPlaying: false });
			get().audioElement?.pause(); // Pause if no previous song

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Idle`,
				});
			}
		}
	},
	setAudioElement: (audio: HTMLAudioElement | null) => {
		set({ audioElement: audio });
	},
	addSongToQueue: (song: Song) => {
		set((state) => ({
			queue: [...state.queue, song],
		}));
	},
	removeSongFromQueue: (songId: string) => {
		set((state) => ({
			queue: state.queue.filter((song) => song._id !== songId),
			currentIndex: state.queue[state.currentIndex]?._id === songId
				? -1 // Reset index if current song is removed
				: state.currentIndex > state.queue.findIndex((song) => song._id === songId) && state.currentIndex !== -1
					? state.currentIndex - 1 // Decrement index if removing a song before the current one
					: state.currentIndex,
			currentSong: state.queue[state.currentIndex]?._id === songId ? null : state.currentSong,
		}));
	},
	reorderQueue: (oldIndex: number, newIndex: number) => {
		set((state) => {
			const newQueue = arrayMove(state.queue, oldIndex, newIndex);
			// Adjust current index if the current song was moved
			const newCurrentIndex = newQueue.findIndex(song => song._id === state.currentSong?._id);
			return {
				queue: newQueue,
				currentIndex: newCurrentIndex !== -1 ? newCurrentIndex : state.currentIndex,
			};
		});
	},
}));
