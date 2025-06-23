import { Song } from '@/types';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// This is a test comment to trigger Vercel re-evaluation.
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useEffect } from 'react';
import { toast } from 'sonner';

interface AddSongToPlaylistDialogProps {
    song: Song | null;
    isOpen: boolean;
    onClose: () => void;
    onAddSong: (playlistId: string, songId: string) => Promise<void>;
}

const AddSongToPlaylistDialog = ({ song, isOpen, onClose, onAddSong }: AddSongToPlaylistDialogProps) => {
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
    );
};

export default AddSongToPlaylistDialog;