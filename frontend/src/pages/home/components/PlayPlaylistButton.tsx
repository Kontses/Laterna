import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Playlist } from "@/types";
import { Pause, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPlaylistById } from "@/lib/api";
import { toast } from "sonner";
import { useQueueStore } from "@/stores/useQueueStore";

const PlayPlaylistButton = ({ playlist, className = "" }: { playlist: Playlist; className?: string }) => {
    const { currentSong, isPlaying, setCurrentSong, togglePlay, initializeQueue } = usePlayerStore();
    const { setShowQueue } = useQueueStore();
    const isCurrentPlaylistPlaying = currentSong?.playlistId === playlist._id && isPlaying;

    const { data: fullPlaylist, isLoading: isPlaylistLoading } = useQuery({
        queryKey: ["playlist", playlist._id],
        queryFn: () => getPlaylistById(playlist._id),
        enabled: false, // Will be fetched on demand
    });

    const handlePlayPlaylist = async (event: React.MouseEvent) => {
        event.stopPropagation(); // Stop event propagation to prevent navigating to playlist page
        if (isCurrentPlaylistPlaying) {
            togglePlay();
        } else {
            if (fullPlaylist) {
                initializeQueue(fullPlaylist.songs);
                if (fullPlaylist.songs.length > 0) {
                    setCurrentSong(fullPlaylist.songs[0]);
                    setShowQueue(true); // Open queue when playing playlist
                } else {
                    toast.info("This playlist has no songs.");
                }
            } else {
                // Fetch playlist if not already fetched
                try {
                    const fetchedPlaylist = await getPlaylistById(playlist._id);
                    initializeQueue(fetchedPlaylist.songs);
                    if (fetchedPlaylist.songs.length > 0) {
                        setCurrentSong(fetchedPlaylist.songs[0]);
                        setShowQueue(true); // Open queue when playing playlist
                    } else {
                        toast.info("This playlist has no songs.");
                    }
                } catch (error) {
                    toast.error("Failed to fetch playlist songs.");
                    console.error("Error fetching playlist songs:", error);
                }
            }
        }
    };

    return (
        <Button
            size={"icon"}
            onClick={handlePlayPlaylist}
            disabled={isPlaylistLoading}
            className={`absolute bottom-3 right-2 bg-purple-500 hover:bg-purple-400 hover:scale-105 transition-all
            opacity-0 translate-y-2 group-hover:translate-y-0
            ${isCurrentPlaylistPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"} ${className}`}
        >
            {isCurrentPlaylistPlaying ? (
                <Pause className='size-5' fill='black' />
            ) : (
                <Play className='size-5' fill='black' />
            )}
        </Button>
    );
};

export default PlayPlaylistButton; 