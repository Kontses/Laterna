import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Artist, Album, Single } from '../../types';
import { axiosInstance } from '@/lib/axios'; // Assuming axiosInstance is used for API calls

const ArtistPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="container mx-auto p-4">
      {/* Artist Name */}
      <h1 className="text-3xl font-bold mb-4">{artist.name}</h1>

      {/* Profile Photo */}
      <div className="mb-8">
        <img src={artist.profilePhotoUrl} alt={`${artist.name}'s profile`} className="w-32 h-32 rounded-full object-cover" />
      </div>

      {/* Albums Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Albums</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* TODO: Map over albums and display them */}
          {artist.albums.map((album) => (
            <div key={album._id} className="flex flex-col items-center">
              {/* Album Cover */}
              <img src={album.coverUrl} alt={album.title} className="w-full h-auto rounded-md mb-2" />
              {/* Album Title */}
              <p className="text-sm font-medium">{album.title}</p>
              {/* Album Year and Type */}
              <p className="text-xs text-gray-500">{album.year} &bull; {album.type}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Singles Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Singles</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* TODO: Map over singles and display them */}
          {artist.singles.map((single) => (
            <div key={single._id} className="flex flex-col items-center">
              {/* Single Cover */}
              <img src={single.coverUrl} alt={single.title} className="w-full h-auto rounded-md mb-2" />
              {/* Single Title */}
              <p className="text-sm font-medium">{single.title}</p>
              {/* Single Year and Type */}
              <p className="text-xs text-gray-500">{single.year} &bull; {single.type}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">About</h2>
        <p className="text-gray-700">{artist.about}</p>
      </section>
    </div>
  );
};

export default ArtistPage;
