import { create } from "zustand";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";
import { arrayMove } from '@dnd-kit/sortable'; // Import arrayMove from dnd-kit
import { axiosInstance } from "@/lib/axios"; // Import axiosInstance

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
	playSong: (song: Song) => void; // Explicit play function
	pauseSong: () => void; // Explicit pause function
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

	playSong: (song: Song) => {
		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
			// Call the backend API to record recent play
			axiosInstance.post(`/songs/play/${song._id}`)
				.catch(error => console.error("Error recording recent play:", error));
		}
		set({
			currentSong: song,
			currentIndex: get().queue.findIndex((s) => s._id === song._id),
			isPlaying: true,
		});
		get().audioElement?.src !== song.audioUrl && (get().audioElement!.src = song.audioUrl);
		get().audioElement?.play();
	},

	pauseSong: () => {
		set({ isPlaying: false });
		get().audioElement?.pause();
		const socket = useChatStore.getState().socket;
		if (socket.auth && get().currentSong) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Idle`,
			});
		}
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;
		const song = songs[startIndex];
		get().playSong(song);
		set({
			queue: songs,
			currentIndex: startIndex,
		});
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;
		get().playSong(song);
	},

	togglePlay: () => {
		const { isPlaying, currentSong } = get();
		if (isPlaying) {
			get().pauseSong();
		} else {
			if (currentSong) {
				get().playSong(currentSong);
			}
		}
	},

	playNext: () => {
		const { currentIndex, queue } = get();
		const nextIndex = currentIndex + 1;

		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];
			get().playSong(nextSong);
			set({ currentIndex: nextIndex });
		} else {
			get().pauseSong();
		}
	},

	playPrevious: () => {
		const { currentIndex, queue } = get();
		const prevIndex = currentIndex - 1;

		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];
			get().playSong(prevSong);
			set({ currentIndex: prevIndex });
		} else {
			get().pauseSong();
		}
	},
	setAudioElement: (audio: HTMLAudioElement | null) => {
		set({ audioElement: audio });
		if (audio) {
			audio.addEventListener("ended", get().playNext);
		}
	},

	addSongToQueue: (song: Song) => {
		set((state) => ({
			queue: [...state.queue, song],
		}));
	},

	removeSongFromQueue: (songId: string) => {
		set((state) => ({
			queue: state.queue.filter((song) => song._id !== songId),
		}));
	},
	reorderQueue: (oldIndex: number, newIndex: number) => {
		set((state) => ({
			queue: arrayMove(state.queue, oldIndex, newIndex),
		}));
	},
}));
