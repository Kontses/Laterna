import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { HomeIcon, Library, MessageCircle, Music, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from 'sonner';

const LeftSidebar = () => {
	const { playlists, fetchPlaylists, createPlaylist, isLoading } = usePlaylistStore();
	const { user, isAuthenticated } = useAuth();
	const [newPlaylistName, setNewPlaylistName] = useState('');
	const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
	const [newPlaylistImageUrl, setNewPlaylistImageUrl] = useState('');
	const [newPlaylistIsPublic, setNewPlaylistIsPublic] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	useEffect(() => {
		if (isAuthenticated && user) {
			fetchPlaylists();
		}
	}, [fetchPlaylists, isAuthenticated, user]);

	const handleCreatePlaylist = async () => {
		if (!newPlaylistName) {
			toast.error('Playlist name cannot be empty.');
			return;
		}
		const newPlaylist = await createPlaylist(newPlaylistName, newPlaylistDescription, newPlaylistImageUrl, newPlaylistIsPublic);
		if (newPlaylist) {
			toast.success(`Playlist "${newPlaylist.name}" created successfully!`);
			setNewPlaylistName('');
			setNewPlaylistDescription('');
			setNewPlaylistImageUrl('');
			setNewPlaylistIsPublic(true);
			setIsDialogOpen(false);
		} else {
			toast.error('Failed to create playlist.');
		}
	};

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
					{isAuthenticated && (
						<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
							<DialogTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='text-white hover:bg-zinc-800'
									aria-label='Create new playlist'
								>
									<Plus className='size-5 text-violet-500 font-extrabold' />
								</Button>
							</DialogTrigger>
							<DialogContent aria-describedby={undefined}>
								<DialogHeader>
									<DialogTitle>Create New Playlist</DialogTitle>
								</DialogHeader>
								<div className='grid gap-4 py-4'>
									<div className='grid grid-cols-4 items-center gap-4'>
										<Label htmlFor='name' className='text-right'>
											Name
										</Label>
										<Input
											id='name'
											value={newPlaylistName}
											onChange={(e) => {
												console.log("Input value (from onChange):", e.target.value);
												setNewPlaylistName(e.target.value);
												console.log("New Playlist Name state after update:", e.target.value);
											}}
											onKeyDown={(e) => {
												console.log("Key Down - Key:", e.key, "Code:", e.code);
												if (e.key === ' ') {
													e.preventDefault();
													setNewPlaylistName(prev => prev + ' ');
													console.log("Space key pressed, new value (forced):");
												}
											}}
											className='col-span-3'
										/>
									</div>
								</div>
								<Button onClick={handleCreatePlaylist} disabled={isLoading}>Create Playlist</Button>
							</DialogContent>
						</Dialog>
					)}
				</div>

				<ScrollArea className='flex-1 max-h-full'>
					<div className='space-y-2 px-4 pb-4'>
						{isLoading ? (
							<PlaylistSkeleton />
						) : isAuthenticated ? (
							Array.isArray(playlists) && playlists.length > 0 ? (
								playlists.map((playlist) => (
									<Link
										to={`/playlists/${playlist._id}`}
										key={playlist._id}
										className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
									>
										{playlist.imageUrl ? (
											<img
												src={playlist.imageUrl}
												alt='Playlist img'
												className='size-12 rounded-md flex-shrink-0 object-cover'
											/>
										) : (
											<div className='size-12 rounded-md flex-shrink-0 bg-zinc-700 flex items-center justify-center'>
												<Music className='size-6 text-white/50' />
											</div>
										)}

										<div className='flex-1 min-w-0 hidden md:block'>
											<p className='font-medium truncate'>{playlist.name}</p>
											<p className='text-sm text-zinc-400 truncate'>Playlist • {playlist.user?.nickname || "Unknown User"}</p>
										</div>
									</Link>
								))
							) : (
								<p className="text-zinc-400 text-sm">No playlists created yet.</p>
							)
						) : (
							<p className="text-zinc-400 text-sm">Login to use your Playlists.</p>
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
export default LeftSidebar;
