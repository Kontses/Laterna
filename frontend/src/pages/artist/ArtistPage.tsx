import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Artist } from '../../types';
import { axiosInstance } from '@/lib/axios';
import { ScrollArea } from "@/components/ui/scroll-area";
import { FastAverageColor } from 'fast-average-color';
import { Button } from "@/components/ui/button"; // Import Button
import { Play, ChevronLeft, ChevronRight } from "lucide-react"; // Import icons
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
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false); // State for video modal
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null); // State for current video URL
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
        console.log("Fetched artist data:", response.data);

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
    console.log("handleFollowToggle called");
    if (!artistId) {
      console.log("Artist ID missing");
      return;
    }

    try {
      const endpoint = `/artists/${artistId}/toggle-follow`;
      const method = isFollowing ? 'delete' : 'post';
      console.log(`Calling API: ${method.toUpperCase()} ${endpoint}`);

      await axiosInstance[method](endpoint);
      setIsFollowing(!isFollowing); // Toggle the state on success
      console.log("Follow status toggled successfully. New state:", !isFollowing);
    } catch (error) {
      console.error("Error toggling follow status:", error);
      // Optionally, revert the UI state or show an error message
    }
  };

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const openVideoModal = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setCurrentVideoUrl(null);
    setIsVideoModalOpen(false);
  };

  const goToNextImage = () => {
    if (artist) {
      const allImages = [...(artist.photos || [])]; // Combine profile photo and gallery images
      if (allImages.length > 0) {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
      }
    }
  };

  const goToPreviousImage = () => {
    if (artist) {
      const allImages = [...(artist.photos || [])]; // Combine profile photo and gallery images
      if (allImages.length > 0) {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex - 1 + allImages.length) % allImages.length
        );
      }
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

  // Combine profile photo and artist photos for gallery modal
  const allGalleryImagesForModal = artist.profilePhotoUrl ? 
    [{ url: artist.profilePhotoUrl, name: `${artist.name}'s profile`, _id: 'profile-photo' }, ...(artist.photos || [])] : 
    ([...(artist.photos || [])]);

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
            {/* Artist Header Section (Profile Photo and Name) */}
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
                <Play className='h-7 w-7 text-black' fill='black' />
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

            {/* Main Content Sections (Albums, About, Gallery, Music Videos) */}
            <div className="container mx-auto p-4">
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
                        <p className="text-sm font-medium truncate w-full text-center">{album.title}</p>
                        {/* Μορφοποίηση της ημερομηνίας για να εμφανίζεται μόνο το έτος */}
                        {album.releaseDate && <p className="text-xs text-zinc-400">{new Date(album.releaseDate).getFullYear()}</p>}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* About Section */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                <p className="text-white" dangerouslySetInnerHTML={{ __html: artist.about.replace(/\n/g, '<br />') }}></p>
              </section>

              {/* Gallery Section */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {/* Artist Profile Photo as the first item */}
                  {artist.profilePhotoUrl && (
                    <div 
                      key="profile-photo" 
                      className="relative group cursor-pointer transition-all duration-300 hover:scale-105"
                      onClick={() => openGallery(0)} // Move onClick to the parent div
                    >
                         <img
                         src={artist.profilePhotoUrl}
                         alt={`${artist.name}'s profile`}
                         className="w-full h-48 object-cover rounded-md"
                       />
                         {/* Optional: Overlay on hover */}
                       <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                         <span className="text-white text-center text-sm font-semibold px-2">View Image</span>
                       </div>
                     </div>
                  )}
                  {/* Additional Gallery Photos */}
                  {artist.photos && artist.photos.length > 0 && (
                    artist.photos.map((photo, index) => (
                      <div 
                        key={photo._id} 
                        className="relative group cursor-pointer transition-all duration-300 hover:scale-105"
                        onClick={() => openGallery((artist.profilePhotoUrl ? 1 : 0) + index)} // Move onClick to the parent div
                      >
                           <img
                           src={photo.url}
                           alt={photo.name || `Gallery image ${index + 1}`}
                           className="w-full h-48 object-cover rounded-md"
                         />
                           {/* Optional: Display photo name or description on hover */}
                         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                           <span className="text-white text-center text-sm font-semibold px-2">{photo.name || "View Image"}</span>
                         </div>
                       </div>
                    ))
                  )}
                </div>
              </section>

              {/* Music Videos Section */}
              {artist.musicVideos && artist.musicVideos.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Music Videos</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {artist.musicVideos.map((video, index) => (
                      <div key={video._id} className="relative group cursor-pointer" onClick={() => openVideoModal(video.url)}>
                           {/* You might want a thumbnail here instead of just a text representation */}
                           {/* For simplicity, using video name and description */}
                           <div className="w-full h-48 bg-zinc-800 rounded-md flex flex-col items-center justify-center p-4 text-center transition-all duration-300 group-hover:scale-105">
                           <Play className="h-12 w-12 text-violet-500 mb-2" />
                           <h4 className="font-semibold text-white truncate w-full px-2">{video.name || `Music Video ${index + 1}`}</h4>
                             {video.description && (
                               <p className="text-sm text-zinc-400 truncate w-full px-2">{video.description}</p>
                             )}
                           </div>
                           {/* Optional: Overlay on hover */}
                         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                           <span className="text-white text-center text-sm font-semibold px-2">Play Video</span>
                         </div>
                       </div>
                    ))}
                  </div>
                </section>
              )}

            </div> {/* End of container mx-auto p-4 div */}

          </div> {/* End of relative z-10 div */}
        </div> {/* End of relative div */}

        {/* Gallery Modal */}
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent className="max-w-screen-lg max-h-screen-lg flex flex-col items-center justify-center">
            <VisuallyHidden><DialogTitle>Artist Gallery</DialogTitle></VisuallyHidden>
             {allGalleryImagesForModal.length > 0 && (
               <div className="relative">
                 <img src={allGalleryImagesForModal[currentImageIndex].url} alt={allGalleryImagesForModal[currentImageIndex].name || `Gallery image ${currentImageIndex + 1}`} className="max-w-full max-h-[80vh] object-contain" />
                 <Button
                   variant="ghost"
                   size="icon"
                   className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                   onClick={goToPreviousImage}
                 >
                   <ChevronLeft className="h-7 w-7" />
                 </Button>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                   onClick={goToNextImage}
                 >
                   <ChevronRight className="h-7 w-7" />
                 </Button>
               </div>
             )}
          </DialogContent>
        </Dialog>

        {/* Video Player Modal */}
        <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
           <DialogContent className="max-w-screen-lg max-h-screen-lg p-0 overflow-hidden">
             <VisuallyHidden><DialogTitle>Music Video</DialogTitle></VisuallyHidden>
            {currentVideoUrl && (
              <video controls width="100%" height="auto" src={currentVideoUrl} className="max-w-full max-h-[80vh]">
                Your browser does not support the video tag.
              </video>
            )}
          </DialogContent>
        </Dialog>

      </ScrollArea> {/* End of ScrollArea */}
    </div>
  );
};

export default ArtistPage;