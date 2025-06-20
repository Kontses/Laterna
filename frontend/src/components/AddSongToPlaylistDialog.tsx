import { Song } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AddSongToPlaylistDialogProps {
    song: Song;
    children: React.ReactNode; // For the DialogTrigger
}

const AddSongToPlaylistDialog = ({ song, children }: AddSongToPlaylistDialogProps) => {
    const { playlists, fetchPlaylists, addSongToPlaylist } = usePlaylistStore();
    const [isAddPlaylistDialogOpen, setIsAddPlaylistDialogOpen] = useState(false);

    useEffect(() => {
        if (isAddPlaylistDialogOpen) {
            fetchPlaylists();
        }
    }, [isAddPlaylistDialogOpen, fetchPlaylists]);

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
        <Dialog open={isAddPlaylistDialogOpen} onOpenChange={setIsAddPlaylistDialogOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add to Playlist</DialogTitle>
                </DialogHeader>
                <div className='grid gap-2 py-4'>
                    {playlists.length > 0 ? (
                        playlists.map((playlist) => (
                            <div
                                key={playlist._id}
                                onClick={() => handleAddToPlaylist(playlist._id)}
                                className='flex items-center gap-2 p-2 hover:bg-zinc-700 rounded-md cursor-pointer'
                            >
                                <img
                                    src={playlist.imageUrl || '/src/assets/placeholder-playlist.png'}
                                    alt={playlist.name}
                                    className='size-8 rounded-sm object-cover'
                                />
                                <span className='text-white'>{playlist.name}</span>
                            </div>
                        ))
                    ) : (
                        <p className='text-zinc-400'>No playlists available. Create one first!</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddSongToPlaylistDialog;