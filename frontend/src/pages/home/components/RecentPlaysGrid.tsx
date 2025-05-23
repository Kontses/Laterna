import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton"; // Can reuse skeleton
import PlayButton from "./PlayButton";
import { usePlayerStore } from "@/stores/usePlayerStore"; // Import usePlayerStore

type RecentPlaysGridProps = {
	songs: Song[];
	isLoading: boolean;
};

const RecentPlaysGrid = ({ songs, isLoading }: RecentPlaysGridProps) => {
	const { setCurrentSong } = usePlayerStore(); // Get setCurrentSong from player store

	if (isLoading) return <SectionGridSkeleton />; // Reuse existing skeleton

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
			{songs.map((song) => (
				<div
					key={song._id}
					className='bg-zinc-800/40 p-2 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer flex items-center'
					onClick={() => setCurrentSong(song)} // Make the whole card clickable
				>
					<div className='relative w-16 h-16 mr-4'>
						<div className='aspect-square rounded-md shadow-lg overflow-hidden'>
							<img
								src={song.imageUrl}
								alt={song.title}
								className='w-full h-full object-cover transition-transform duration-300 
								group-hover:scale-105'
							/>
						</div>
						{/* PlayButton is still here for visual consistency, but the whole card is clickable */}
						<PlayButton song={song} className="absolute bottom-1 right-1 size-8" />
					</div>
					<div className="flex-1">
						<h3 className='font-medium text-sm truncate'>{song.title}</h3>
						<p className='text-xs text-zinc-400 truncate'>{song.artist}</p>
					</div>
				</div>
			))}
		</div>
	);
};

export default RecentPlaysGrid;
