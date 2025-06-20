import { Song } from '@/types';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils'; // Assuming you have this utility
import { usePlayerStore } from '@/stores/usePlayerStore';
import { Plus } from 'lucide-react';
import AddSongToPlaylistDialog from "@/components/AddSongToPlaylistDialog"; // Import the new dialog component
import { Button } from "@/components/ui/button";

interface SongItemProps {
	song: Song;
	index?: number; // Optional index for display
}

const SongItem = ({ song, index }: SongItemProps) => {
	const { currentSong, playSong, pauseSong, isPlaying } = usePlayerStore();
	const isCurrent = currentSong?._id === song._id;

	const handlePlay = () => {
		if (isCurrent && isPlaying) {
			pauseSong();
		} else {
			playSong(song);
		}
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
			<AddSongToPlaylistDialog song={song}>
				<Button variant='ghost' size='icon' className='hover:bg-zinc-700' onClick={(e) => e.stopPropagation()}>
					<Plus className='size-5 text-zinc-400 hover:text-white' />
				</Button>
			</AddSongToPlaylistDialog>
		</div>
	);
};

export default SongItem; 