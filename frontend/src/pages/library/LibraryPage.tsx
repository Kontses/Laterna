import React, { useEffect, useState } from 'react';
import { useMusicStore } from "@/stores/useMusicStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AlbumGrid from "../home/components/AlbumGrid";
import ArtistGrid from "../home/components/ArtistGrid"; // Import ArtistGrid
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { useLocation } from 'react-router-dom'; // Import useLocation

const LibraryPage: React.FC = () => {
  const { albums, fetchAlbums, isLoading, artists, fetchArtists } = useMusicStore();
  const location = useLocation();
  const initialViewMode = (location.state as any)?.viewMode || "albums";
  const initialSortOption = (location.state as any)?.sortOption || "newest";

  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "alphabetical"> (initialSortOption);
  const [viewMode, setViewMode] = useState<"albums" | "artists"> (initialViewMode); // 'albums' or 'artists'

  useEffect(() => {
    fetchAlbums();
    fetchArtists();
  }, [fetchAlbums, fetchArtists]);

  const sortedAlbums = [...albums].sort((a, b) => {
    if (sortOption === "newest") {
      const dateA = new Date(a.releaseDate).getTime();
      const dateB = new Date(b.releaseDate).getTime();
      return dateB - dateA;
    } else if (sortOption === "oldest") {
      const dateA = new Date(a.releaseDate).getTime();
      const dateB = new Date(b.releaseDate).getTime();
      return dateA - dateB;
    } else if (sortOption === "alphabetical") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const sortedArtists = [...artists].sort((a, b) => {
    if (sortOption === "newest") {
      return b._id.localeCompare(a._id); // Assuming _id contains a timestamp for creation order
    } else if (sortOption === "oldest") {
      return a._id.localeCompare(b._id); // Assuming _id contains a timestamp for creation order
    } else if (sortOption === "alphabetical") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className='p-4 sm:p-6'>
          <h1 className='text-2xl sm:text-3xl font-bold mb-6'>Library</h1>
          <div className='flex justify-between items-center mb-8'>
            <div className='flex gap-4'>
              <Button onClick={() => setViewMode("albums")}
                      variant={viewMode === "albums" ? "default" : "outline"}>
                Discography
              </Button>
              <Button onClick={() => setViewMode("artists")}
                      variant={viewMode === "artists" ? "default" : "outline"}>
                Artists
              </Button>
            </div>
            <Select onValueChange={(value: "newest" | "oldest" | "alphabetical") => setSortOption(value)} defaultValue={sortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                {viewMode === "albums" ? (
                  <>
                    <SelectItem value="newest">Newest Releases</SelectItem>
                    <SelectItem value="oldest">Oldest Releases</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="newest">Newest Artists</SelectItem>
                    <SelectItem value="oldest">Oldest Artists</SelectItem>
                  </>
                )}
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {viewMode === "albums" ? (
            <AlbumGrid albums={sortedAlbums} isLoading={isLoading} />
          ) : (
            <ArtistGrid artists={sortedArtists} isLoading={isLoading} />
          )}
        </div>
      </ScrollArea>
    </main>
  );
};

export default LibraryPage; 