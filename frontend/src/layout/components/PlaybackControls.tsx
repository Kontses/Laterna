import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ListMusic, Mic2, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume1, Info, Settings, Plus, VolumeX, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import AddSongToPlaylistDialog from "@/components/AddSongToPlaylistDialog";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface PlaybackControlsProps {
	onToggleQueue: () => void;
	onToggleAlbumDescription: () => void;
}

export const PlaybackControls = ({ onToggleQueue, onToggleAlbumDescription }: PlaybackControlsProps) => {
	const { currentSong, isPlaying, togglePlay, playNext, playPrevious } = usePlayerStore();

	const [volume, setVolume] = useState(75);
	const [prevVolume, setPrevVolume] = useState(75);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [streamingQuality, setStreamingQuality] = useState("good");

	useEffect(() => {
		const audio = usePlayerStore.getState().audioElement;
		audioRef.current = audio;

		if (!audio) return;

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
								<div className="flex items-center gap-x-2">
									{currentSong?.albumId ? (
										<Link to={`/albums/${currentSong.albumId}`} className='font-medium truncate hover:underline'>
											{currentSong.title}
										</Link>
									) : (
										<Link to={`/artists/${currentSong?.artistId}`} className='font-medium truncate hover:underline'>
											{currentSong?.title}
										</Link>
									)}
									<AddSongToPlaylistDialog song={currentSong}>
										<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400' disabled={!currentSong}>
											<Plus className='h-4 w-4' />
										</Button>
									</AddSongToPlaylistDialog>
								</div>

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
				{/* volume controls and right-side icons */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%] justify-end'>
					{/* Microphone button */}
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400' onClick={() => toast.error('This is for future upgrade')}>
						<Mic2 className='h-4 w-4' />
					</Button>

					{/* Playback Queue button */}
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400' onClick={onToggleQueue}>
						<ListMusic className='h-4 w-4' />
					</Button>

					{/* Album Description (Info) button */}
					<Button
						size='icon'
						variant='ghost'
						className='hover:text-white text-zinc-400'
						onClick={onToggleAlbumDescription}
						disabled={!currentSong || !currentSong.albumId}
					>
						<Info className='h-4 w-4' />
					</Button>

					{/* Streaming Quality Selector */}
					<Select onValueChange={(value) => {
						if (value === "bad") {
							toast.error("At Laterna we don't play music in bad quality!");
						} else {
							setStreamingQuality(value);
						}
					}} defaultValue={streamingQuality}>
						<SelectTrigger className="w-[40px] h-8 p-0 border-none bg-transparent focus:ring-0 focus:ring-offset-0 data-[state=open]:bg-zinc-800">
							<Settings className='h-4 w-4 text-zinc-400 hover:text-white transition-colors' />
							<VisuallyHidden>
								<SelectValue placeholder="Quality" />
							</VisuallyHidden>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="original">Original</SelectItem>
							<SelectItem value="good">Good (320kbps)</SelectItem>
							<SelectItem value="medium">Medium (192kbps)</SelectItem>
							<SelectItem value="bad">Bad</SelectItem>
						</SelectContent>
					</Select>

					{/* Volume control */}
					<div
						className='flex items-center gap-2'
						onWheel={(e) => {
							if (!audioRef.current) return;
							const newVolume = Math.max(0, Math.min(100, volume - e.deltaY * 0.1));
							setVolume(newVolume);
							setPrevVolume(newVolume);
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
									setPrevVolume(volume);
									setVolume(0);
									audioRef.current.volume = 0;
								}
							}}
						>
							{volume === 0 ? (
								<VolumeX className='h-4 w-4' />
							) : volume < 50 ? (
								<Volume1 className='h-4 w-4' />
							) : (
								<Volume2 className='h-4 w-4' />
							)}
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
