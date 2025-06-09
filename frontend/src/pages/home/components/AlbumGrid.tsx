import { Album } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PlayButton from "@/pages/home/components/PlayButton";

type AlbumGridProps = {
	title: string;
	albums: Album[];
	isLoading: boolean;
};

const AlbumGrid = ({ albums, title, isLoading }: AlbumGridProps) => {
	if (isLoading) return <SectionGridSkeleton />;

	return (
		<div className='mb-8'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl sm:text-2xl font-bold'>{title}</h2>
				<Button variant='link' className='text-sm text-zinc-400 hover:text-white'>
					Show all
				</Button>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{albums.map((album) => (
					<Link to={`/albums/${album._id}`} key={album._id}>
						<div
							className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer'
						>
							<div className='relative mb-4'>
								<div className='aspect-square rounded-md shadow-lg overflow-hidden'>
									<img
										src={album.imageUrl}
										alt={album.title}
										className='w-full h-full object-cover transition-transform duration-300 
										group-hover:scale-105'
									/>
								</div>
								{album.songs && album.songs.length > 0 && (
									<PlayButton song={album.songs[0]} />
								)}
							</div>
							<h3 className='font-medium mb-2 truncate'>{album.title}</h3>
							{album.artistId && typeof album.artistId === 'object' && album.artistId.name && (
								<p className='text-sm text-zinc-400 truncate'>{album.artistId.name}</p>
							)}
							{album.releaseDate && (
								<p className='text-xs text-zinc-400'>{new Date(album.releaseDate).getFullYear()}</p>
							)}
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};

export default AlbumGrid; 