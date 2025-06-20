import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton"; // Can reuse skeleton
import PlayButton from "./PlayButton";
import { usePlayerStore } from "@/stores/usePlayerStore"; // Import usePlayerStore

type RecentPlaysGridProps = {
	songs: Song[];
	isLoading: boolean;
	onImageHover: (imageUrl: string | null) => void;
};

const RecentPlaysGrid = ({ songs, isLoading, onImageHover }: RecentPlaysGridProps) => {
	const { setCurrentSong } = usePlayerStore(); // Get setCurrentSong from player store

	if (isLoading) return <SectionGridSkeleton />; // Reuse existing skeleton

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 grid-rows-2 overflow-hidden'>
			{songs.map((song) => (
				<div
					key={song._id}
					className='bg-zinc-800/40 p-2 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer flex items-center relative'
					onClick={() => setCurrentSong(song)} // Make the whole card clickable
					onMouseEnter={() => onImageHover(song.imageUrl)}
					onMouseLeave={() => onImageHover(null)}
				>
					<div className='w-16 h-16 mr-4 flex-shrink-0'>
						<img
							src={song.imageUrl}
							alt={song.title}
							className='w-full h-full object-cover rounded-md'
						/>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className='font-medium text-sm truncate'>{song.title}</h3>
						<p className='text-xs text-zinc-400 truncate'>{song.artist}</p>
					</div>
					<PlayButton song={song} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
				</div>
			))}
		</div>
	);
};

export default RecentPlaysGrid;
