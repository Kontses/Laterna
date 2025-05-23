import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAlbumDescriptionStore } from "@/stores/useAlbumDescriptionStore"; // Import the store
import { Clock, Pause, Play, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { FastAverageColor } from 'fast-average-color'; // Added import

const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
	const { albumId } = useParams();
	const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const { setAlbumDescription } = useAlbumDescriptionStore(); // Get setAlbumDescription from the store

	const [artistName, setArtistName] = useState<string | null>(null);
	const [gradientColor, setGradientColor] = useState<string>("#5038a0"); // Default static color - Reverted to state

	useEffect(() => {
		if (albumId) fetchAlbumById(albumId);
	}, [fetchAlbumById, albumId]);

	useEffect(() => {
		if (currentAlbum?.description) {
			setAlbumDescription(currentAlbum.description);
		}

		const fetchArtistNameAndExtractColor = async () => { // Renamed function back
			if (currentAlbum?.artistId) {
				try {
					const response = await axiosInstance.get(`/api/artists/${currentAlbum.artistId}`);
					setArtistName(response.data.name);
				} catch (error) {
					console.error("Error fetching artist name:", error);
					setArtistName("Unknown Artist");
				}
			}

			if (currentAlbum?.imageUrl) {
				const fac = new FastAverageColor();
				try {
					const color = await fac.getColorAsync(currentAlbum.imageUrl);
					setGradientColor(color.rgba);
				} catch (error) {
					console.error("Error extracting color:", error);
					setGradientColor("#5038a0"); // Fallback on error
				}
			}
		};
		fetchArtistNameAndExtractColor(); // Call the renamed function
	}, [currentAlbum, setAlbumDescription]);


	if (isLoading) return null;

	const handlePlayAlbum = () => {
		if (!currentAlbum) return;

		const isCurrentAlbumPlaying = currentAlbum?.songs.some((song) => song._id === currentSong?._id);
		if (isCurrentAlbumPlaying) togglePlay();
		else {
			// start playing the album from the beginning
			playAlbum(currentAlbum?.songs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!currentAlbum) return;

		playAlbum(currentAlbum?.songs, index);
	};

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				{/* Main Content */}
				<div className='relative'> {/* Removed min-h-full */}
					{/* bg gradient */}
					<div
						className='absolute inset-0 bg-gradient-to-b via-zinc-900/80
					 to-zinc-900 pointer-events-none'
						style={{ backgroundColor: gradientColor, backgroundImage: `linear-gradient(to bottom, ${gradientColor}, rgb(24,24,27) 70%)` }}
						aria-hidden='true'
					/>

					{/* Content */}
					<div className='relative z-10'>
						<div className='flex p-6 gap-6 pb-8'>
							<img
								src={currentAlbum?.imageUrl}
								alt={currentAlbum?.title}
								className='w-[240px] h-[240px] shadow-xl rounded'
							/>
							<div className='flex flex-col justify-end'>
								<p className='text-sm font-medium'>Album</p>
								<h1 className='text-5xl font-bold my-4'>{currentAlbum?.title}</h1>
								<div className='flex items-center gap-2 text-sm text-zinc-100'>
									{currentAlbum?.artistId && (
										<Link to={`/artists/${currentAlbum.artistId}`} className='hover:underline'>
											<span className='font-medium text-white'>{artistName || "Unknown Artist"}</span>
										</Link>
									)}
									<span>• {currentAlbum?.songs.length} songs</span>
									<span>• {currentAlbum?.year}</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											if (currentAlbum) {
												const cloudName = 'YOUR_CLOUD_NAME'; // Replace with your Cloudinary cloud name
												const folderPath = `laterna/artists/${artistName || "Unknown Artist"}/${currentAlbum.title}`;
												const zipUrl = `https://res.cloudinary.com/${cloudName}/image/list/${folderPath}/archive.zip`;
												window.open(zipUrl, '_blank');
											}
										}}
									>
										Download Album
									</Button>
								</div>
							</div>
						</div>

						{/* Album Description - Removed from here */}

						{/* play button */}
						<div className='px-6 pb-4 flex items-center gap-6'>
							<Button
								onClick={handlePlayAlbum}
								size='icon'
								className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-400
                hover:scale-105 transition-all'
							>
								{isPlaying && currentAlbum?.songs.some((song) => song._id === currentSong?._id) ? (
									<Pause className='h-7 w-7 text-black' />
								) : (
									<Play className='h-7 w-7 text-black' />
								)}
							</Button>
						</div>

						{/* Table Section */}
						<div className='bg-black/20 backdrop-blur-sm'>
							{/* table header */}
							<div
								className='grid grid-cols-[16px_5fr_60px_auto] gap-4 px-10 py-2 text-sm
            text-zinc-400 border-b border-white/5'
							>
								<div>#</div>
								<div>Title</div>
								<div>
									<Clock className='h-4 w-4' />
								</div>
								<div><Download className='h-4 w-4' /></div>
							</div>

							{/* songs list */}

							<div className='px-6'>
								<div className='space-y-2 py-4'>
									{currentAlbum?.songs.map((song, index) => {
										const isCurrentSong = currentSong?._id === song._id;
										return (
											<div
												key={song._id}
												onClick={() => handlePlaySong(index)}
												className={`grid grid-cols-[16px_5fr_60px_auto] gap-4 px-4 py-2 text-sm
                      text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer
                      `}
											>
												<div className='flex items-center justify-center'>
													{isCurrentSong && isPlaying ? (
														<div className='size-4 text-green-500'>♫</div>
													) : (
														<span className='group-hover:hidden'>{index + 1}</span>
													)}
													{!isCurrentSong && (
														<Play className='h-4 w-4 hidden group-hover:block' />
													)}
												</div>

												<div className='flex items-center gap-3'>
													<img src={song.imageUrl} alt={song.title} className='size-10' />

													<div>
														<div className={`font-medium text-white`}>{song.title}</div>
														{song?.artistId && (
															<Link to={`/artists/${song.artistId}`} className='hover:underline'>
																{song.artist}
															</Link>
														)}
													</div>
												</div>
												<div className='flex items-center'>{formatDuration(song.duration)}</div>
												<div className='flex items-center'>
													<Button
														variant="ghost"
														size="icon"
														onClick={(e) => {
															e.stopPropagation(); // Prevent triggering the song play
															const link = document.createElement('a');
															link.href = song.audioUrl;
															link.setAttribute('download', `${song.title}.mp3`); // Set the download attribute with filename
															document.body.appendChild(link);
															link.click();
															document.body.removeChild(link);
														}}
													>
														<Download className='h-4 w-4' />
													</Button>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};
export default AlbumPage;
