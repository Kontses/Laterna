import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAlbumDescriptionStore } from "@/stores/useAlbumDescriptionStore"; // Import the store
import { Laptop2, ListMusic, Mic2, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume1, Info } from "lucide-react"; // Import Info icon
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
	const { currentSong, isPlaying, togglePlay, playNext, playPrevious } = usePlayerStore();
	const { toggleAlbumDescription } = useAlbumDescriptionStore(); // Get toggle function from the store

	const [volume, setVolume] = useState(75);
	const [prevVolume, setPrevVolume] = useState(75); // New state to store previous volume
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		// Get the audio element from the store
		const audio = usePlayerStore.getState().audioElement;
		audioRef.current = audio; // Assign to local ref for time/duration/volume

		if (!audio) return;

		// Set initial volume
		audio.volume = volume / 100;

		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => setDuration(audio.duration);

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);

		const handleEnded = () => {
			usePlayerStore.setState({ isPlaying: false });
		};

		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
			audio.removeEventListener("ended", handleEnded);
		};
	}, [currentSong, volume]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.code === 'Space') {
				event.preventDefault();
				togglePlay();
			} else if (event.ctrlKey && event.key === 'ArrowLeft') {
				event.preventDefault();
				playPrevious();
			} else if (event.ctrlKey && event.key === 'ArrowRight') {
				event.preventDefault();
				playNext();
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [togglePlay, playPrevious, playNext]);

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
		}
	};

	return (
		<footer className='h-20 sm:h-24 bg-zinc-900 border-t border-zinc-800 px-4'>
			<div className='flex justify-between items-center h-full max-w-[1800px] mx-auto'>
				{/* currently playing song */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%]'>
					{currentSong && (
						<>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-14 h-14 object-cover rounded-md'
							/>
							<div className='flex-1 min-w-0 flex flex-col'>
								{currentSong?.albumId ? (
									<Link to={`/albums/${currentSong.albumId}`} className='font-medium truncate hover:underline'>
										{currentSong.title}
									</Link>
								) : (
									<Link to={`/artists/${currentSong?.artistId}`} className='font-medium truncate hover:underline'>
										{currentSong?.title}
									</Link>
								)}

								{currentSong?.artistId && (
									<Link to={`/artists/${currentSong.artistId}`} className='text-sm text-zinc-400 truncate hover:underline'>
										{currentSong.artist}
									</Link>
								)}
							</div>
						</>
					)}
				</div>

				{/* player controls*/}
				<div className='flex flex-col items-center gap-2 flex-1 max-w-full sm:max-w-[45%]'>
					<div className='flex items-center gap-4 sm:gap-6'>
						<Button
							size='icon'
							variant='ghost'
							className='hidden sm:inline-flex hover:text-white text-zinc-400'
						>
							<Shuffle className='h-4 w-4' />
						</Button>

						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playPrevious}
							disabled={!currentSong}
						>
							<SkipBack className='h-4 w-4' />
						</Button>

						<Button
							size='icon'
							className='bg-white hover:bg-white/80 text-black rounded-full h-8 w-8'
							onClick={togglePlay}
							disabled={!currentSong}
						>
							{isPlaying ? <Pause className='h-5 w-5' fill='black' /> : <Play className='h-5 w-5' fill='black' />}
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playNext}
							disabled={!currentSong}
						>
							<SkipForward className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='hidden sm:inline-flex hover:text-white text-zinc-400'
						>
							<Repeat className='h-4 w-4' />
						</Button>
					</div>

					<div className='hidden sm:flex items-center gap-2 w-full'>
						<div className='text-xs text-zinc-400'>{formatTime(currentTime)}</div>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full hover:cursor-grab active:cursor-grabbing'
							onValueChange={handleSeek}
						/>
						<div className='text-xs text-zinc-400'>{formatTime(duration)}</div>
					</div>
				</div>
				{/* volume controls */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%] justify-end'>
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
						<Mic2 className='h-4 w-4' />
					</Button>
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
						<ListMusic className='h-4 w-4' />
					</Button>
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
						<Laptop2 className='h-4 w-4' />
					</Button>

					{/* Info button */}
					<Button
						size='icon'
						variant='ghost'
						className='hover:text-white text-zinc-400'
						onClick={() => toggleAlbumDescription()} // Call toggle function from the store
					>
						<Info className='h-4 w-4' />
					</Button>

					<div
						className='flex items-center gap-2'
						onWheel={(e) => {
							if (!audioRef.current) return;
							const newVolume = Math.max(0, Math.min(100, volume - e.deltaY * 0.1)); // Adjust sensitivity
							setVolume(newVolume);
							setPrevVolume(newVolume); // Update prevVolume as well
							audioRef.current.volume = newVolume / 100;
						}}
					>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={() => {
								if (!audioRef.current) return;
								if (volume === 0) {
									setVolume(prevVolume);
									audioRef.current.volume = prevVolume / 100;
								} else {
									setPrevVolume(volume); // Save current volume before muting
									setVolume(0);
									audioRef.current.volume = 0;
								}
							}}
						>
							<Volume1 className='h-4 w-4' />
						</Button>

						<Slider
							value={[volume]}
							max={100}
							step={1}
							className='w-24 hover:cursor-grab active:cursor-grabbing'
							onValueChange={(value) => {
								setVolume(value[0]);
								if (audioRef.current) {
									audioRef.current.volume = value[0] / 100;
								}
							}}
						/>
					</div>
				</div>
			</div>
		</footer>
	);
};
