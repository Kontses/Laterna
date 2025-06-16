import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Album } from "@/types";
import { Pause, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAlbumById } from "@/lib/api";
import { toast } from "sonner";
import { useQueueStore } from "@/stores/useQueueStore";

const PlayAlbumButton = ({ album, className = "" }: { album: Album; className?: string }) => {
    const { currentSong, isPlaying, setCurrentSong, togglePlay, initializeQueue } = usePlayerStore();
    const { setShowQueue } = useQueueStore();
    // Check if the current playing song belongs to this album and is currently playing
    const isCurrentAlbumPlaying = currentSong?.albumId === album._id && isPlaying;

    const { data: fullAlbum, isLoading: isAlbumLoading } = useQuery({
        queryKey: ["album", album._id],
        queryFn: () => getAlbumById(album._id),
        enabled: false, // Will be fetched on demand
    });

    const handlePlayAlbum = async (event: React.MouseEvent) => {
        event.stopPropagation(); // Stop event propagation to prevent navigating to album page
        event.preventDefault(); // Prevent default link behavior
        if (isCurrentAlbumPlaying) {
            togglePlay();
        } else {
            if (fullAlbum) {
                initializeQueue(fullAlbum.songs);
                if (fullAlbum.songs.length > 0) {
                    setCurrentSong(fullAlbum.songs[0]);
                    setShowQueue(true); // Open queue when playing album
                } else {
                    toast.info("This album has no songs.");
                }
            } else {
                // Fetch album if not already fetched
                try {
                    const fetchedAlbum = await getAlbumById(album._id);
                    initializeQueue(fetchedAlbum.songs);
                    if (fetchedAlbum.songs.length > 0) {
                        setCurrentSong(fetchedAlbum.songs[0]);
                        setShowQueue(true); // Open queue when playing album
                    } else {
                        toast.info("This album has no songs.");
                    }
                } catch (error) {
                    toast.error("Failed to fetch album songs.");
                    console.error("Error fetching album songs:", error);
                }
            }
        }
    };

    return (
        <Button
            size={"icon"}
            onClick={handlePlayAlbum}
            disabled={isAlbumLoading}
            className={`absolute bottom-3 right-2 bg-purple-500 hover:bg-purple-400 hover:scale-105 transition-all
            opacity-0 translate-y-2 group-hover:translate-y-0
            ${isCurrentAlbumPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"} ${className}`}
        >
            {isCurrentAlbumPlaying ? (
                <Pause className='size-5' fill='black' />
            ) : (
                <Play className='size-5' fill='black' />
            )}
        </Button>
    );
};

export default PlayAlbumButton; 