import { Song } from '@/types';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils'; // Assuming you have this utility
import { usePlayerStore } from '@/stores/usePlayerStore';
import { Plus, Download, Play } from 'lucide-react';
import AddSongToPlaylistDialog from "@/components/AddSongToPlaylistDialog"; // Import the new dialog component
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useState } from 'react';

interface SongItemProps {
	song: Song;
	index?: number; // Optional index for display
	handlePlaySong: (index: number) => void; // Add handlePlaySong prop
	isCurrentSong: boolean; // Add isCurrentSong prop
	isPlaying: boolean; // Add isPlaying prop
	onAddSongToPlaylist: (playlistId: string, songId: string) => Promise<void>; // New prop
}

const SongItem = ({ song, index, handlePlaySong, isCurrentSong, isPlaying, onAddSongToPlaylist }: SongItemProps) => {
	const [isAddPlaylistDialogOpen, setIsAddPlaylistDialogOpen] = useState(false); // New state

	const handleDownloadSong = () => {
		toast.info('Download song functionality is for future upgrade.');
	};

	return (
		<div
			className={cn(
				`grid grid-cols-[16px_5fr_80px_40px_40px_60px] gap-4 px-4 py-2 text-sm
                      text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer
                      ${isCurrentSong ? 'text-white' : ''}
                      `
			)}
			onClick={() => index !== undefined && handlePlaySong(index)}
		>
			<div className='flex items-center justify-center'>
				{isCurrentSong ? (
					<div className={`size-4 ${isPlaying ? 'playing-note' : 'text-purple-500'}`}>♫</div>
				) : (
					<span className='group-hover:hidden'>{index !== undefined ? index + 1 : ''}</span>
				)}
				{!isCurrentSong && (
					<Play className='h-4 w-4 hidden group-hover:block' />
				)}
			</div>

			<div className='flex items-center gap-3'>
				<img src={song.imageUrl} alt={song.title} className='size-10' />
				<div>
					<div className={`font-medium ${isCurrentSong ? 'text-purple-500' : 'text-white'}`}>{song.title}</div>
					<p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
				</div>
			</div>

			{/* Column 3: Date Added */}
			<div className='flex items-center justify-end'>
				{song.dateAdded && (
					<span className='text-zinc-400 text-sm'>
						{new Date(song.dateAdded).toLocaleDateString()}
					</span>
				)}
			</div>

			{/* Column 4: Add to Playlist Button */}
			<div className='flex items-center justify-end'>
				<AddSongToPlaylistDialog
					song={song}
					isOpen={isAddPlaylistDialogOpen}
					onClose={() => setIsAddPlaylistDialogOpen(false)}
					onAddSong={onAddSongToPlaylist}
				>
					<Button
						variant='ghost'
						size='icon'
						className='rounded-full w-8 h-8 hover:bg-zinc-700'
						onClick={(e) => {
							e.stopPropagation();
							setIsAddPlaylistDialogOpen(true);
						}}
					>
						<Plus className='size-4 text-zinc-400 hover:text-white' />
					</Button>
				</AddSongToPlaylistDialog>
			</div>

			{/* Column 5: Download Button */}
			<div className='flex items-center justify-end'>
				<Button variant='ghost' size='icon' className='rounded-full w-8 h-8 hover:bg-zinc-700' onClick={(e) => {
					e.stopPropagation();
					handleDownloadSong();
				}}>
					<Download className='size-4 text-zinc-400 hover:text-white' />
				</Button>
			</div>

			{/* Column 6: Duration */}
			<div className='flex items-center justify-end text-zinc-400 text-sm'>{formatDuration(song.duration)}</div>
		</div>
	);
};

export default SongItem; 