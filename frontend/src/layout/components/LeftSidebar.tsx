import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { HomeIcon, Library, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Artist } from "@/types";

const LeftSidebar = () => {
	const { albums, fetchAlbums, isLoading } = useMusicStore();
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	useEffect(() => {
		const token = localStorage.getItem("token");
		setIsAuthenticated(!!token);

		const handleStorageChange = () => {
			const newToken = localStorage.getItem("token");
			setIsAuthenticated(!!newToken);
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, []);

	console.log({ albums });

	return (
		<div className='h-full flex flex-col gap-2'>
			{/* Navigation menu */}

			<div className='rounded-lg bg-zinc-900 p-4'>
				<div className='space-y-2'>
					<Link
						to={"/"}
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<HomeIcon className='mr-2 size-5' />
						<span className='hidden md:inline'>Home</span>
					</Link>

					{isAuthenticated && (
						<Link
							to={"/chat"}
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full justify-start text-white hover:bg-zinc-800",
								})
							)}
						>
							<MessageCircle className='mr-2 size-5' />
							<span className='hidden md:inline'>Messages</span>
						</Link>
					)}
					<Link
						to={"/library"}
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<Library className='mr-2 size-5' />
						<span className='hidden md:inline'>Library</span>
					</Link>
				</div>
			</div>

			{/* Library section */}
			<div className='flex-1 rounded-lg bg-zinc-900 flex flex-col min-h-0'>
				<div className='flex items-center justify-between mb-4 px-4 pt-4'>
					<div className='flex items-center text-white px-2'>
						<Library className='size-5 mr-2' />
						<span className='hidden md:inline'>Playlists</span>
					</div>
				</div>

				<ScrollArea className='flex-1 max-h-full'>
					<div className='space-y-2 px-4 pb-4'>
						{isLoading ? (
							<PlaylistSkeleton />
						) : (
							albums.map((album) => (
								<Link
									to={`/albums/${album._id}`}
									key={album._id}
									className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
								>
									<img
										src={album.imageUrl}
										alt='Playlist img'
										className='size-12 rounded-md flex-shrink-0 object-cover'
									/>

									<div className='flex-1 min-w-0 hidden md:block'>
										<p className='font-medium truncate'>{album.title}</p>
										<p className='text-sm text-zinc-400 truncate'>Album • {album.artistId && typeof album.artistId === 'object' ? (album.artistId as Artist).name : "Unknown Artist"} {/* Χρήση του populate ονόματος καλλιτέχνη */}</p>
									</div>
								</Link>
							))
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
export default LeftSidebar;
