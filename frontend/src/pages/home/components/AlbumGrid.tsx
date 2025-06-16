import { Album } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import PlayAlbumButton from "@/pages/home/components/PlayAlbumButton";

type AlbumGridProps = {
	title?: string;
	albums: Album[];
	isLoading: boolean;
	showAllLink?: { to: string; state: { viewMode: "artists" | "albums"; sortOption: "newest" | "oldest" | "alphabetical" } };
	onImageHover?: (imageUrl: string | null) => void;
};

const AlbumGrid = ({ albums, title, isLoading, showAllLink, onImageHover }: AlbumGridProps) => {
	const navigate = useNavigate();

	if (isLoading) return <SectionGridSkeleton />;

	return (
		<div className='mb-8'>
			<div className='flex items-center justify-between mb-4'>
				{title && <h2 className='text-xl sm:text-2xl font-bold'>{title}</h2>}
				{showAllLink && (
					<Link to={showAllLink.to} state={showAllLink.state}>
						<Button variant='link' className='text-sm text-zinc-400 hover:text-white'>
							Show all
						</Button>
					</Link>
				)}
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{albums.map((album) => (
					<div key={album._id}
						className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer relative'
						onMouseEnter={() => onImageHover && onImageHover(album.imageUrl)}
						onMouseLeave={() => onImageHover && onImageHover(null)}
						onClick={() => navigate(`/albums/${album._id}`)}
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
								<PlayAlbumButton album={album} className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-0 group-hover:-translate-y-1" />
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
				))}
			</div>
		</div>
	);
};

export default AlbumGrid; 