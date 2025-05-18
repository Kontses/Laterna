import React from 'react';
import { Artist, Album, Single } from '../../types';

const ArtistPage: React.FC = () => {
  // TODO: Fetch artist data based on the artist ID from the URL

  const artist: Artist = {
    _id: "placeholder-id", // Placeholder
    name: "Artist Name", // Placeholder
    albums: [], // Placeholder
    singles: [], // Placeholder
    about: "Artist description goes here." // Placeholder
  };

  return (
    <div className="container mx-auto p-4">
      {/* Artist Name */}
      <h1 className="text-3xl font-bold mb-4">{artist.name}</h1>

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
