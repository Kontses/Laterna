import { Song } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useEffect } from 'react';
import { toast } from 'sonner';

interface AddSongToPlaylistDialogProps {
    song: Song | null; // Allow song to be null
    children: React.ReactNode; // For the DialogTrigger
    isOpen: boolean;
    onClose: () => void;
    onAddSong: (playlistId: string, songId: string) => Promise<void>;
}

const AddSongToPlaylistDialog = ({ song, children, isOpen, onClose, onAddSong }: AddSongToPlaylistDialogProps) => {
    const { playlists, fetchPlaylists } = usePlaylistStore();

    useEffect(() => {
        if (isOpen) {
            fetchPlaylists();
        }
    }, [isOpen, fetchPlaylists]);

    const handleAddToPlaylist = async (playlistId: string) => {
        if (!song) {
            toast.error("No song selected to add to playlist.");
            return;
        }
        try {
            await onAddSong(playlistId, song._id);
        } catch (error) {
            console.error("Error adding song to playlist (from dialog):", error);
            toast.error("An error occurred while adding the song.");
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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