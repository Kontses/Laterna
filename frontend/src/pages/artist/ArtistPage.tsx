import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Artist } from '../../types';
import { axiosInstance } from '@/lib/axios';
import { ScrollArea } from "@/components/ui/scroll-area";
import { FastAverageColor } from 'fast-average-color';
import { Button } from "@/components/ui/button"; // Import Button
import { Play, Download, ChevronLeft, ChevronRight } from "lucide-react"; // Import icons
import { Link } from "react-router-dom"; // Import Link
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // Import Dialog components and DialogTitle
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Import VisuallyHidden
import PlayButton from "@/pages/home/components/PlayButton"; // Import PlayButton

const ArtistPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null); // null initially, then true/false
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [gradientColor, setGradientColor] = useState<string>("#5038a0"); // Default static color

  const fac = new FastAverageColor();

  useEffect(() => {
    const fetchArtistDataAndExtractColor = async () => {
      if (!artistId) {
        setError("Artist ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/artists/${artistId}`);
        setArtist(response.data);
        setIsFollowing(response.data.isFollowing); // Set initial follow status
        setError(null);

        if (response.data?.profilePhotoUrl) {
          const color = await fac.getColorAsync(response.data.profilePhotoUrl);
          setGradientColor(color.rgba);
        }
      } catch (err) {
        console.error("Error fetching artist data or extracting color:", err);
        setError("Failed to fetch artist data.");
        setArtist(null);
        setIsFollowing(null); // Reset follow status on error
        setGradientColor("#5038a0"); // Fallback on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistDataAndExtractColor();
  }, [artistId]);

  const handleFollowToggle = async () => {
    if (!artistId) return;

    try {
      const endpoint = `/artists/${artistId}/toggle-follow`;
      const method = isFollowing ? 'delete' : 'post'; // Use DELETE for unfollow, POST for follow

      await axiosInstance[method](endpoint);
      setIsFollowing(!isFollowing); // Toggle the state on success
    } catch (error) {
      console.error("Error toggling follow status:", error);
      // Optionally, revert the UI state or show an error message
    }
  };

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const goToNextImage = () => {
    if (artist && artist.galleryImages) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % artist.galleryImages!.length);
    }
  };

  const goToPreviousImage = () => {
    if (artist && artist.galleryImages) {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex - 1 + artist.galleryImages!.length) % artist.galleryImages!.length
      );
    }
  };

  const downloadImage = () => {
    if (artist && artist.galleryImages && artist.galleryImages[currentImageIndex]) {
      const imageUrl = artist.galleryImages[currentImageIndex];
      console.log("Attempting to download image:", imageUrl); // Added console.log
      const link = document.createElement('a');
      link.href = imageUrl;
      link.setAttribute('download', `artist_image_${currentImageIndex + 1}.jpg`);
      link.setAttribute('target', '_blank'); // Added target="_blank"
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

  const allGalleryImages = [artist.profilePhotoUrl, ...(artist.galleryImages || [])];

  return (
    <div className='h-full'>
      <ScrollArea className='h-full rounded-md'> {/* ScrollArea wraps the entire content */}
        <div className='relative'> {/* Removed min-h-full */}
          {/* bg gradient */}
          <div
            className='absolute inset-0 bg-gradient-to-b via-zinc-900/80
             to-zinc-900 pointer-events-none'
            style={{ backgroundColor: gradientColor, backgroundImage: `linear-gradient(to bottom, ${gradientColor}, rgb(24,24,27) 70%)` }}
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
                <h1 className="text-5xl font-bold my-4">{artist.name}</h1>
              </div>
            </div>

            {/* Play/Follow buttons */}
            <div className='px-6 pb-4 flex items-center gap-6'>
              <Button
                size='icon'
                className='w-14 h-14 rounded-full bg-purple-500 hover:bg-purple-400
                  hover:scale-105 transition-all'
              >
                <Play className='h-7 w-7 text-black' />
              </Button>
              <Button
                variant="ghost"
                className="rounded-full border border-white text-white bg-transparent hover:bg-white/10
                  hover:scale-105 transition-all w-28 flex-shrink-0"
                onClick={handleFollowToggle}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                ...
              </Button>
            </div>

            <div>
              <div className="container mx-auto p-4">
            <div>
                {/* Albums Section */}
                {artist.albums && artist.albums.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Albums</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {artist.albums.map((album) => (
                        <Link to={`/albums/${album._id}`} key={album._id} className="flex flex-col items-center group">
                          <div className="relative w-full">
                            {/* Album Cover */}
                            <img
                              src={album.imageUrl}
                              alt={album.title}
                              className="w-full h-auto rounded-md mb-2 transition-all duration-300 group-hover:scale-105"
                            />
                            {/* Play Button */}
                            {album.songs && album.songs.length > 0 && (
                              <PlayButton song={album.songs[0]} />
                            )}
                          </div>
                          {/* Album Title */}
                          <p className="text-sm font-medium">{album.title}</p>
                          {/* Album Year and Type */}
                          <p className="text-xs text-gray-500">{album.releaseDate} &bull; {album.type}</p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* About Section - Reverted to simple text, but kept white color */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">About</h2>
                  <p className="text-white" dangerouslySetInnerHTML={{ __html: artist.about.replace(/\n/g, '<br />') }}></p>
                </section>

                {/* Gallery Section */}
                {allGalleryImages.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {allGalleryImages.map((imageUrl, index) => (
                        <div key={index} className="cursor-pointer" onClick={() => openGallery(index)}>
                          <img src={imageUrl} alt={`Gallery image ${index + 1}`} className="w-full h-auto rounded-md object-cover" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                </div> {/* NEW WRAPPER DIV ENDS HERE */}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Image Gallery Dialog */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-700 p-6 flex flex-col items-center">
          <VisuallyHidden asChild>
            <DialogTitle>Image Gallery</DialogTitle>
          </VisuallyHidden>
          {allGalleryImages.length > 0 && (
            <>
              <img
                src={allGalleryImages[currentImageIndex]}
                alt={`Gallery image ${currentImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain mb-4"
              />
              <div className="flex items-center gap-4">
                <Button onClick={goToPreviousImage} variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button onClick={downloadImage} variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Download className="h-6 w-6" />
                </Button>
                <Button onClick={goToNextImage} variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArtistPage;
