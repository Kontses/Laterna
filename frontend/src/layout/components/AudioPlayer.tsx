import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);

	const { currentSong, isPlaying, playNext, setAudioElement } = usePlayerStore();

	// Set the audio element in the store
	useEffect(() => {
		setAudioElement(audioRef.current);
	}, [setAudioElement]);

	// handle song ends
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			playNext();
		};

		audio?.addEventListener("ended", handleEnded);

		return () => audio?.removeEventListener("ended", handleEnded);
	}, [playNext]);

	// handle song changes
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;

		// check if this is actually a new song
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;
		if (isSongChange) {
			// Reset audio state
			audio.pause();
			audio.currentTime = 0;
			
			// Set new source
			audio.src = currentSong?.audioUrl;
			
			// Load the new audio
			audio.load();

			// Update previous song reference
			prevSongRef.current = currentSong?.audioUrl;

			// If we're supposed to be playing, start playing
			if (isPlaying) {
				const playPromise = audio.play();
				if (playPromise !== undefined) {
					playPromise.catch(error => {
						console.error("Error playing audio:", error);
						// If there's an error, try to recover
						setTimeout(() => {
							audio.load();
							audio.play().catch(e => console.error("Recovery play failed:", e));
						}, 1000);
					});
				}
			}
		}
	}, [currentSong, isPlaying]);

	// handle play/pause
	useEffect(() => {
		const audio = audioRef.current;

		if (audio) {
			if (isPlaying) {
				const playPromise = audio.play();
				if (playPromise !== undefined) {
					playPromise.catch(error => {
						console.error("Error playing audio:", error);
						// If there's an error, try to recover
						setTimeout(() => {
							audio.load();
							audio.play().catch(e => console.error("Recovery play failed:", e));
						}, 1000);
					});
				}
			} else {
				audio.pause();
			}
		}
	}, [isPlaying]);

	return <audio ref={audioRef} preload="auto" />;
};

export default AudioPlayer;
