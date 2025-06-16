import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Playlist, Song } from "@/types";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Loader, Music, Pencil } from "lucide-react";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import SongItem from "@/components/SongItem";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import PlaylistEditForm from "@/components/PlaylistEditForm";

const PlaylistPage = () => {
	const { id } = useParams<{ id: string }>();
	const [playlist, setPlaylist] = useState<Playlist | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		const fetchPlaylistDetails = async () => {
			if (!id) {
				setError("Playlist ID is missing.");
				setIsLoading(false);
				return;
			}

			try {
				const token = localStorage.getItem("token");
				if (!token) {
					setError("Authentication token not found.");
					setIsLoading(false);
					return;
				}

				const response = await axios.get(`/api/playlists/${id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setPlaylist(response.data);
			} catch (err: any) {
				setError(err.response?.data?.message || "Failed to fetch playlist details.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchPlaylistDetails();
	}, [id]);

	const handleImageClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('image', file);

		try {
			setIsLoading(true);
			const token = localStorage.getItem("token");
			if (!token) {
				toast.error("Authentication token not found.");
				setIsLoading(false);
				return;
			}

			const uploadResponse = await axios.post('/api/upload/image', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${token}`,
				},
			});

			const imageUrl = uploadResponse.data.imageUrl;

			if (playlist) {
				const updateResponse = await axios.put(
					`/api/playlists/${playlist._id}`,
					{ imageUrl },
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				setPlaylist(updateResponse.data);
				toast.success("Playlist image updated successfully!");
			}
		} catch (err: any) {
			console.error("Failed to upload or update playlist image:", err);
			toast.error(err.response?.data?.message || "Failed to update playlist image.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSavePlaylist = async (updatedFields: Partial<Playlist>) => {
		if (!playlist) return;

		try {
			setIsLoading(true);
			const token = localStorage.getItem("token");
			if (!token) {
				toast.error("Authentication token not found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.put(
				`/api/playlists/${playlist._id}`,
				updatedFields,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			setPlaylist(response.data);
			toast.success("Playlist updated successfully!");
		} catch (err: any) {
			console.error("Failed to update playlist:", err);
			toast.error(err.response?.data?.message || "Failed to update playlist.");
		} finally {
			setIsLoading(false);
			setIsEditing(false);
		}
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-full'>
				<Loader className='size-8 text-violet-500 animate-spin' />
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center h-full text-red-500'>
				<p>{error}</p>
			</div>
		);
	}

	if (!playlist) {
		return (
			<div className='flex items-center justify-center h-full'>
				<p>Playlist not found.</p>
			</div>
		);
	}

	return (
		<div className='h-full w-full overflow-hidden rounded-lg bg-zinc-900'>
			<ScrollArea className='h-full w-full'>
				<div className='flex flex-col md:flex-row items-center p-6 gap-6 bg-gradient-to-b from-violet-500/20 to-zinc-900'>
					<div
						className='size-48 w-48 rounded-md shadow-lg flex-shrink-0 cursor-pointer relative group'
						onClick={handleImageClick}
					>
						{playlist.imageUrl ? (
							<img
								src={playlist.imageUrl}
								alt={playlist.name}
								className='size-full rounded-md object-cover'
							/>
						) : (
							<div className='size-full rounded-md bg-zinc-700 flex items-center justify-center'>
								<Music className='size-24 text-white/50' />
							</div>
						)}
						<input
							type='file'
							ref={fileInputRef}
							accept='image/*'
							className='hidden'
							onChange={handleImageChange}
						/>
						<div className='absolute inset-0 bg-black/50 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
							<span className='text-white text-sm'>Click to change image</span>
						</div>
					</div>
					<div className='flex flex-col text-center md:text-left'>
						<h3 className='text-sm font-semibold text-zinc-400'>Playlist</h3>
						<h1 className='text-5xl font-bold mt-2 text-white'>{playlist.name}</h1>
						<p className='text-md text-zinc-300 mt-2'>
							{playlist.description || "No description available."}
						</p>
						<p className='text-sm text-zinc-400 mt-1'>
							Created by {playlist.user?.nickname || "Unknown User"} • {playlist.songs.length} songs
						</p>
						<Button onClick={() => setIsEditing(true)} variant="ghost" size="sm" className='mt-4 text-violet-400 hover:bg-violet-900/40 hover:text-white'>
							<Pencil className="mr-2 h-4 w-4" />
							Edit Playlist
						</Button>
					</div>
				</div>

				<div className='p-6'>
					<h2 className='text-2xl font-bold mb-4'>Songs</h2>
					{
						playlist.songs.length === 0 ? (
							<p className='text-zinc-400'>This playlist has no songs yet.</p>
						) : (
							<div className='space-y-4'>
								{playlist.songs.map((song) => (
									<SongItem key={song._id} song={song} />
								))}
							</div>
						)
					}
				</div>
			</ScrollArea>
			{playlist && (
				<PlaylistEditForm
					playlist={playlist}
					isOpen={isEditing}
					onClose={() => setIsEditing(false)}
					onSave={handleSavePlaylist}
				/>
			)}
		</div>
	);
};

export default PlaylistPage; 