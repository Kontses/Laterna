import { Song } from '@/types';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils'; // Assuming you have this utility
import { usePlayerStore } from '@/stores/usePlayerStore';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SongItemProps {
	song: Song;
	index?: number; // Optional index for display
}

const SongItem = ({ song, index }: SongItemProps) => {
	const { currentSong, playSong, pauseSong, isPlaying } = usePlayerStore();
	const { playlists, fetchPlaylists, addSongToPlaylist } = usePlaylistStore();
	const isCurrent = currentSong?._id === song._id;
	const [isAddPlaylistDialogOpen, setIsAddPlaylistDialogOpen] = useState(false);

	useEffect(() => {
		if (isAddPlaylistDialogOpen) {
			fetchPlaylists();
		}
	}, [isAddPlaylistDialogOpen, fetchPlaylists]);

	const handlePlay = () => {
		if (isCurrent && isPlaying) {
			pauseSong();
		} else {
			playSong(song);
		}
	};

	const handleAddToPlaylist = async (playlistId: string) => {
		try {
			const updatedPlaylist = await addSongToPlaylist(playlistId, song._id);
			if (updatedPlaylist) {
				toast.success(`Song added to ${updatedPlaylist.name}!`);
			} else {
				toast.error("Failed to add song to playlist.");
			}
		} catch (error) {
			console.error("Error adding song to playlist:", error);
			toast.error("An error occurred while adding the song.");
		}
		setIsAddPlaylistDialogOpen(false);
	};

	return (
		<div
			className={cn(
				'flex items-center gap-4 p-2 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer',
				isCurrent && 'bg-zinc-800'
			)}
		>
			{index !== undefined && <span className='text-zinc-400'>{index + 1}.</span>}
			<img
				src={song.imageUrl}
				alt={song.title}
				className='size-12 rounded-md object-cover'
			/>
			<div className='flex-1' onClick={handlePlay}>
				<p className={cn('font-medium truncate', isCurrent && 'text-violet-500')}>{song.title}</p>
				<p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
			</div>
			<span className='text-zinc-400 text-sm'>{formatDuration(song.duration)}</span>
			<Dialog open={isAddPlaylistDialogOpen} onOpenChange={setIsAddPlaylistDialogOpen}>
				<DialogTrigger asChild>
					<Button variant='ghost' size='icon' className='hover:bg-zinc-700'>
						<Plus className='size-5 text-zinc-400 hover:text-white' />
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add to Playlist</DialogTitle>
					</DialogHeader>
					<div className='grid gap-2 py-4'>
						{playlists.length > 0 ? (
							playlists.map((playlist) => (
								<Button
									key={playlist._id}
									variant='ghost'
									className='justify-start'
									onClick={() => handleAddToPlaylist(playlist._id)}
								>
									{playlist.name}
								</Button>
							))
						) : (
							<p className='text-zinc-400'>No playlists available. Create one first!</p>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default SongItem; 