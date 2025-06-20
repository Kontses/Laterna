import { usePlayerStore } from '@/stores/usePlayerStore'; // Import the player store
import { X, ListMusic, History } from 'lucide-react'; // Import the X, ListMusic and History icons
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'; // Import Dnd kit components and hooks
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'; // Import sortable components and hooks, including strategy
import { CSS } from '@dnd-kit/utilities'; // Import CSS utility
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import { useState, useEffect } from "react"; // Import useState and useEffect
import { useRecentPlaysStore } from "@/stores/useRecentPlaysStore"; // Import useRecentPlaysStore
import { useAuth } from "@/providers/AuthProvider"; // Import useAuth
import { Button } from "./ui/button"; // Import Button
import { useLocation } from 'react-router-dom'; // Import useLocation

// Component for each individual sortable song item
const SortableSongItem = ({ song }: { song: any }) => {
  const { setCurrentSong, removeSongFromQueue, currentSong } = usePlayerStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song._id });

  const style = {
    transform: CSS.Transform.toString({
      x: 0, // Explicitly set horizontal transform to 0
      y: transform ? transform.y : 0, // Use vertical transform provided by useSortable
      scaleX: transform ? transform.scaleX : 1, // Maintain original scaleX
      scaleY: transform ? transform.scaleY : 1, // Maintain original scaleY
    }),
    transition,
    zIndex: isDragging ? 1 : 0, // Ensure dragged item is on top
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${currentSong?._id === song._id ? 'bg-zinc-700' : 'hover:bg-zinc-800'} ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => {
        if (!isDragging) {
          setCurrentSong(song);
        }
      }}
    >
      <div className='flex flex-col'>
        <span className='font-medium truncate'>{song.title}</span>
        <span className='text-sm text-zinc-400 truncate'>{song.artist}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeSongFromQueue(song._id);
        }}
        className='text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-700'
      >
        <X size={16} />
      </button>
    </li>
  );
};

// New component for displaying non-sortable song items (for recent plays)
const SongItem = ({ song }: { song: any }) => {
  const { setCurrentSong, currentSong } = usePlayerStore();

  return (
    <li
      className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${currentSong?._id === song._id ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}
      onClick={() => setCurrentSong(song)}
    >
      <div className='flex flex-col'>
        <span className='font-medium truncate'>{song.title}</span>
        <span className='text-sm text-zinc-400 truncate'>{song.artist}</span>
      </div>
    </li>
  );
};

const Queue = () => {
  const { queue, reorderQueue } = usePlayerStore(); // Get queue and reorder function from the store
  const { recentPlays, fetchRecentPlays, isLoading: isRecentPlaysLoading } = useRecentPlaysStore();
  const { user } = useAuth();
  const location = useLocation(); // Get location object
  const [showRecentPlays, setShowRecentPlays] = useState(location.state?.showRecentPlays || false); // Initialize with state from navigation

  useEffect(() => {
    if (user) {
      fetchRecentPlays();
    }
  }, [fetchRecentPlays, user]);

  useEffect(() => {
    // Update showRecentPlays if location.state changes (e.g., navigating from profile page)
    setShowRecentPlays(location.state?.showRecentPlays || false);
  }, [location.state]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 }, axis: 'y' }), // Restrict to vertical axis
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = queue.findIndex((song) => song._id === active.id);
      const newIndex = queue.findIndex((song) => song._id === over?.id);
      reorderQueue(oldIndex, newIndex);
    }
  };

  return (
    <div className='h-full bg-zinc-900 rounded-lg flex flex-col'>
      <div className='p-4 flex justify-between items-center border-b border-zinc-800'>
        <div className='flex items-center gap-2'>
          {showRecentPlays ? <History className='size-5 shrink-0' /> : <ListMusic className='size-5 shrink-0' />}
          <h2 className='font-semibold'>{showRecentPlays ? "Recent Plays" : "Playback Queue"}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRecentPlays(!showRecentPlays)}
          className="text-zinc-400 hover:text-white"
        >
          {showRecentPlays ? "Show Queue" : "Show History"}
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        {showRecentPlays ? (
          // Display Recent Plays
          isRecentPlaysLoading ? (
            <p className='text-zinc-400'>Loading recent plays...</p>
          ) : recentPlays.length > 0 ? (
            <ul>
              {recentPlays.map((song) => (
                <SongItem key={song._id} song={song} />
              ))}
            </ul>
          ) : (
            <p className='text-zinc-400'>No recent plays.</p>
          )
        ) : (
          // Display Playback Queue
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={queue.map(song => song._id)} strategy={verticalListSortingStrategy}>
              {
                queue.length > 0 ? (
                  <ul>
                    {queue.map((song) => (
                      <SortableSongItem key={song._id} song={song} />
                    ))}
                  </ul>
                ) : (
                  <p className='text-zinc-400'>The playback queue is empty.</p>
                )
              }
            </SortableContext>
          </DndContext>
        )}
      </ScrollArea>
    </div>
  );
};

export default Queue; 