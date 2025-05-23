import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Artist, Album, Single } from '../../types';
import { axiosInstance } from '@/lib/axios'; // Assuming axiosInstance is used for API calls
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button"; // Import Button
import { Play, Pause } from "lucide-react"; // Import icons
import { Link } from "react-router-dom"; // Import Link

const ArtistPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false); // State for follow button

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!artistId) {
        setError("Artist ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/api/artists/${artistId}`);
        setArtist(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching artist data:", err);
        setError("Failed to fetch artist data.");
        setArtist(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement actual follow/unfollow API call
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading artist data...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  if (!artist) {
    return <div className="container mx-auto p-4">Artist not found.</div>;
  }

  return (
    <div className='h-full'>
      <ScrollArea className='h-full rounded-md'> {/* ScrollArea wraps the entire content */}
        <div className='relative min-h-full'>
          {/* bg gradient */}
          <div
            className='absolute inset-0 bg-gradient-to-b from-[#5038a0]/80 via-zinc-900/80
             to-zinc-900 pointer-events-none'
            aria-hidden='true'
          />

          {/* Content */}
          <div className='relative z-10'>
            <div className='flex flex-col p-6 pb-8'>
              {/* Profile Photo */}
              <img
                src={artist.profilePhotoUrl}
                alt={`${artist.name}'s profile`}
                className="w-full h-[300px] object-cover absolute top-0 left-0 z-0"
              />
              <div className="relative z-10 flex flex-col justify-end h-[300px] text-white p-4">
                {/* Removed "Επαληθευμένος καλλιτέχνης" */}
                <h1 className="text-5xl font-bold my-4">{artist.name}</h1>
                {/* Removed monthlyListeners */}
              </div>
            </div>

            {/* Play/Follow buttons */}
            <div className='px-6 pb-4 flex items-center gap-6'>
              <Button
                size='icon'
                className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-400
                  hover:scale-105 transition-all'
              >
                <Play className='h-7 w-7 text-black' />
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white text-white hover:bg-white/10"
                onClick={handleFollowToggle}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                ...
              </Button>
            </div>

            <div className="bg-black/20 backdrop-blur-sm"> {/* Moved background to this div */}
              <div className="container mx-auto p-4">
                {/* Albums Section */}
                {artist.albums && artist.albums.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Albums</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {artist.albums.map((album) => (
                        <Link to={`/albums/${album._id}`} key={album._id} className="flex flex-col items-center">
                          {/* Album Cover */}
                          <img src={album.imageUrl} alt={album.title} className="w-full h-auto rounded-md mb-2" />
                          {/* Album Title */}
                          <p className="text-sm font-medium">{album.title}</p>
                          {/* Album Year and Type */}
                          <p className="text-xs text-gray-500">{album.year} &bull; {album.type}</p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Singles Section */}
                {artist.singles && artist.singles.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Singles</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {artist.singles.map((single) => (
                        <div key={single._id} className="flex flex-col items-center">
                          {/* Single Cover */}
                          <img src={single.imageUrl} alt={single.title} className="w-full h-auto rounded-md mb-2" />
                          {/* Single Title */}
                          <p className="text-sm font-medium">{single.title}</p>
                          {/* Single Year and Type */}
                          <p className="text-xs text-gray-500">{single.year} &bull; {single.type}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* About Section */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">About</h2>
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: artist.about.replace(/\n/g, '<br />') }}></p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ArtistPage;
