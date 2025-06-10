import React, { useState, useRef, useEffect } from 'react'; // Import useEffect
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { axiosInstance } from "@/lib/axios"; // Import axiosInstance
import toast from "react-hot-toast"; // Import toast
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@clerk/clerk-react"; // Import useAuth
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'; // Import restrictToVerticalAxis and restrictToParentElement
import CryptoJS from 'crypto-js'; // Import crypto-js

// Function to calculate MD5 hash of a file using crypto-js
const calculateMD5 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryString = event.target?.result as string;
      const md5Hash = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(binaryString)).toString();
      resolve(md5Hash);
    };
    reader.onerror = (event) => {
      reject(event.target?.error);
    };
    reader.readAsBinaryString(file);
  });
};

// Function to get audio duration
const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = (event) => {
      reject(event);
    };
    audio.src = URL.createObjectURL(file);
  });
};

const UploadArea = ({ artistListVersion }: { artistListVersion: number }) => {
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth(); // Get getToken from useAuth

  const [artists, setArtists] = useState<any[]>([]); // State to store artists
  const [loadingArtists, setLoadingArtists] = useState(true); // State to manage loading state of artists

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axiosInstance.get("/api/artists");
        setArtists(response.data);
      } catch (error) {
        console.error("Error fetching artists:", error);
        toast.error("Failed to load artists.");
      } finally {
        setLoadingArtists(false);
      }
    };

    fetchArtists();
  }, [artistListVersion]); // Fetch artists when the component mounts or getToken changes


  const [singleSongDetails, setSingleSongDetails] = useState({
    title: "",
    artistId: "", // Change to artistId for single songs as well
    releaseDate: "", // Add releaseDate for singles
    generalGenre: "", // Add generalGenre for singles
    specificGenres: "", // Store as raw string for input for singles
    description: "", // Added description field for singles
    // Add other single song fields as needed (e.g., genre, tags, description)
  });

  const [albumDetails, setAlbumDetails] = useState({
    title: "",
    artistId: "", // Change to artistId
    releaseDate: "", // Change to releaseDate string
    generalGenre: "", // Add generalGenre
    specificGenres: "", // Store as raw string for input
    description: "", // Added description field
  });

  const [albumSongsDetails, setAlbumSongsDetails] = useState<{ title: string, fileName: string, md5: string, duration: number }[]>([]); // Include fileName, md5, and duration

  // New state for additional album files
  const [additionalAlbumFiles, setAdditionalAlbumFiles] = useState<File[]>([]);

  // New state for media uploads
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaDetails, setMediaDetails] = useState({
    artistId: "",
    name: "", // Add name field for media
    description: "",
  });
  const [isMediaDragging, setIsMediaDragging] = useState(false);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false);

  // Create a ref for the songs list container
  const songsListRef = useRef<HTMLUListElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of motion before activating
      },
      axis: 'y', // Limit movement to the vertical axis
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Modifiers to restrict dragging within the container and vertically
  const modifiers = [
    restrictToVerticalAxis,
    restrictToParentElement,
  ];

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('audio/'));
    setAudioFiles(files);
    // Initialize albumSongsDetails based on dropped files, including fileName, md5 hash, and duration
    const songsDetails = await Promise.all(files.map(async file => {
      const md5 = await calculateMD5(file);
      const duration = await getAudioDuration(file);
      return { title: file.name.replace(/\.[^/.]+$/, ""), fileName: file.name, md5: md5, duration: duration };
    }));
    setAlbumSongsDetails(songsDetails);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('audio/'));
    setAudioFiles(files);
     // Initialize albumSongsDetails based on selected files, including fileName, md5 hash, and duration
    const songsDetails = await Promise.all(files.map(async file => {
      const md5 = await calculateMD5(file);
      const duration = await getAudioDuration(file);
      return { title: file.name.replace(/\.[^/.]+$/, ""), fileName: file.name, md5: md5, duration: duration };
    }));
    setAlbumSongsDetails(songsDetails);
  };

   const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
		}
	};

  // Handler for selecting additional album files
  const handleAdditionalAlbumFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAdditionalAlbumFiles(files);
  };

  const handleSubmit = async () => {
    if (audioFiles.length === 0) {
      toast.error("Please upload at least one audio file.");
      return;
    }
    if (!imageFile) {
       toast.error("Please upload artwork.");
       return;
    }

    // Basic validation for song titles
    if (audioFiles.length === 1) {
      if (!singleSongDetails.title.trim()) {
        toast.error("Please enter a title for the song.");
        return;
      }
    } else {
      const emptyTitleSong = albumSongsDetails.find(song => !song.title.trim());
      if (emptyTitleSong) {
        toast.error(`Please enter a title for the song "${emptyTitleSong.fileName}".`);
        return;
      }
    }

    setIsLoading(true);
    const formData = new FormData();

    // Append audio files under the key 'audioFiles'
    audioFiles.forEach((file) => {
      formData.append('audioFiles', file); // Use 'audioFiles' as the key
    });

    // Append image file
    formData.append('imageFile', imageFile); // Use the key 'imageFile' as expected in backend

    // Append form details based on the number of audio files
    if (audioFiles.length === 1) {
      // When submitting a single song, process specificGenres and include all fields
      const specificGenresArray = (singleSongDetails.specificGenres as any as string).split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      formData.append('singleSongDetails', JSON.stringify({...singleSongDetails, specificGenres: specificGenresArray})); // Send processed specificGenres
    } else {
      // When submitting, split and trim specificGenres from the raw input value
      const specificGenresArray = (albumDetails.specificGenres as any as string).split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      formData.append('albumDetails', JSON.stringify({...albumDetails, specificGenres: specificGenresArray})); // Send processed specificGenres
      formData.append('albumSongsDetails', JSON.stringify(albumSongsDetails)); // albumSongsDetails will now have the correct order

      // Append additional album files
      additionalAlbumFiles.forEach((file) => {
        formData.append('additionalAlbumFiles', file); // Use a new key, e.g., 'additionalAlbumFiles'
      });

      // Append the list of additional album file names in their current order
      const additionalAlbumFileNames = additionalAlbumFiles.map(file => file.name);
      formData.append('additionalAlbumFileNames', JSON.stringify(additionalAlbumFileNames));
    }

    try {
      const token = await getToken(); // Get the token
      const response = await axiosInstance.post("/admin/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`, // Add Authorization header
        },
      });

      console.log("Upload successful:", response.data);
      toast.success(audioFiles.length === 1 ? "Song uploaded successfully!" : "Album uploaded successfully!");

      // Clear form
      setAudioFiles([]);
      setImageFile(null);
      setSingleSongDetails({ title: "", artistId: "", releaseDate: "", generalGenre: "", specificGenres: "" as string, description: "" }); // Clear all single song fields
      setAlbumDetails({ title: "", artistId: "", releaseDate: "", generalGenre: "", specificGenres: "" as string, description: "" }); // Clear specificGenres as raw string and add description
      setAlbumSongsDetails([]);
      setAdditionalAlbumFiles([]); // Clear additional files state
       if (fileInputRef.current) fileInputRef.current.value = "";
       if (imageInputRef.current) imageInputRef.current.value = "";


    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error("Upload failed: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setAlbumSongsDetails((items) => {
        const oldIndex = items.findIndex(item => item.title === active.id); // Assuming title is unique for simplicity
        const newIndex = items.findIndex(item => item.title === over.id);

        // Use arrayMove from @dnd-kit/sortable/utilities
        const arrayMove = (array: any[], oldIndex: number, newIndex: number) => {
          const newArray = [...array];
          const [element] = newArray.splice(oldIndex, 1);
          newArray.splice(newIndex, 0, element);
          return newArray;
        };

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // New handleDragEnd for additional album files
  const handleAdditionalFilesDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setAdditionalAlbumFiles((items) => {
        const oldIndex = items.findIndex(item => item.name === active.id); // Use file name as ID
        const newIndex = items.findIndex(item => item.name === over.id);

        const arrayMove = (array: File[], oldIndex: number, newIndex: number): File[] => {
          const newArray = [...array];
          const [element] = newArray.splice(oldIndex, 1);
          newArray.splice(newIndex, 0, element);
          return newArray;
        };

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // SortableItem component for individual songs
  const SortableItem = ({ song, index }: { song: { title: string, fileName: string, md5: string, duration: number }, index: number }) => { // Update prop type
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: song.title }); // Use song title as the unique ID

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center space-x-2 bg-zinc-800 p-2 rounded-md cursor-grab" // Added cursor style
      >
        <span className="text-zinc-400">{index + 1}.</span>
        <Input
          value={song.title}
          onChange={(e) => {
            setAlbumSongsDetails(prevSongs =>
              prevSongs.map((s, i) => {
                if (i === index) {
                  return { ...s, title: e.target.value }; // Update title
                }
                return s;
              })
            );
          }}
          className='bg-zinc-700 border-zinc-600 flex-grow'
          placeholder={`Enter title for ${song.fileName}`} // Use song.fileName here
        />
        <span className="text-zinc-400 text-sm">{song.fileName}</span> {/* Display song.fileName */}
        {/* Add edit/delete icons later */}
      </li>
    );
  };

  // New SortableItem component for additional album files
  const SortableAdditionalFileItem = ({ file, index }: { file: File, index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: file.name }); // Use file name as the unique ID

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center space-x-2 bg-zinc-800 p-2 rounded-md cursor-grab" // Added cursor style, similar to song items
      >
        <span className="text-zinc-400">{index + 1}.</span>
        <span className="text-white flex-grow">{file.name}</span> {/* Display file name */}
        {/* Add remove icon later */}
      </li>
    );
  };

  // New handlers for media upload
  const handleMediaDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsMediaDragging(true);
  };

  const handleMediaDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsMediaDragging(false);
  };

  const handleMediaDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsMediaDragging(false);
    const file = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'))[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const handleMediaFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = Array.from(event.target.files || []).filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'))[0];
     if (file) {
      setMediaFile(file);
    }
  };

  const handleMediaSubmit = async () => {
    if (!mediaFile) {
      toast.error("Please upload a media file.");
      return;
    }
    if (!mediaDetails.artistId) {
       toast.error("Please select an artist.");
       return;
    }

    setIsMediaLoading(true);
    const formData = new FormData();
    formData.append('mediaFile', mediaFile);
    formData.append('artistId', mediaDetails.artistId);
    formData.append('description', mediaDetails.description);
    formData.append('name', mediaDetails.name); // Append the media name

    try {
      const token = await getToken();
      const response = await axiosInstance.post("/admin/upload-media", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Media upload successful:", response.data);
      toast.success("Media uploaded successfully!");

      // Clear form
      setMediaFile(null);
      setMediaDetails({ artistId: "", name: "", description: "" }); // Clear media details including name
      if (mediaFileInputRef.current) mediaFileInputRef.current.value = "";

    } catch (error: any) {
      console.error("Media upload failed:", error);
      toast.error("Media upload failed: " + (error.response?.data?.message || error.message));
    } finally {
      setIsMediaLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <h3 className="text-lg font-semibold text-white">2. Add an Album or Single</h3>
       <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-blue-500 bg-blue-900/20' : 'border-zinc-700 bg-zinc-800/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className='mb-4'>
          <Upload className='mx-auto h-12 w-12 text-zinc-400' />
        </div>
        <p className='text-zinc-400 mb-4'>Drag and drop audio files here, or click to select files</p>
        <input type="file" multiple accept="audio/*" className="hidden" id="audio-upload-input" onChange={handleFileSelect} ref={fileInputRef} />
        <label htmlFor="audio-upload-input" className="cursor-pointer bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded">
          Choose files
        </label>
      </div>

      {audioFiles.length > 0 && (
        <div className="space-y-6">
           <input
						type='file'
						ref={imageInputRef}
						onChange={handleImageSelect}
						accept='image/*'
						className='hidden'
					/>
					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						onClick={() => imageInputRef.current?.click()}
					>
						<div className='text-center'>
							<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
								<Upload className='h-6 w-6 text-zinc-400' />
							</div>
							<div className='text-sm text-zinc-400 mb-2'>
								{imageFile ? imageFile.name : "Upload album/single artwork"}
							</div>
							<Button variant='outline' size='sm' className='text-xs'>
								Choose File
							</Button>
						</div>
					</div>

          {/* Conditionally render forms based on the number of audio files */}
          {audioFiles.length === 1 ? (
            /* Single Song Form */
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Single Song Details</h3>
               <div className='space-y-2'>
                  <label className='text-sm font-medium'>Song Title</label>
                  <Input
                    value={singleSongDetails.title}
                    onChange={(e) => setSingleSongDetails({ ...singleSongDetails, title: e.target.value })}
                    className='bg-zinc-800 border-zinc-700'
                    placeholder='Enter song title'
                  />
                </div>
                 <div className='space-y-2'>
                  <label className='text-sm font-medium'>Artist</label>
                   <Select onValueChange={(value) => setSingleSongDetails({ ...singleSongDetails, artistId: value })} value={singleSongDetails.artistId}>
                    <SelectTrigger className="w-full bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder={loadingArtists ? "Loading artists..." : "Select an artist"} />
                    </SelectTrigger>
                    <SelectContent className='bg-zinc-900 text-white border-zinc-700'>
                      {artists.map(artist => (
                        <SelectItem key={artist._id} value={artist._id}>
                          {artist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Add Release Date field for singles */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Release Date</label>
                  <Input
                    type='date'
                    value={singleSongDetails.releaseDate}
                    onChange={(e) => setSingleSongDetails({ ...singleSongDetails, releaseDate: e.target.value })}
                    className='bg-zinc-800 border-zinc-700'
                  />
                </div>
                {/* Add Genre Section for singles */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold mt-6">Genre</h4>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>General Genre</label>
                    <Select onValueChange={(value) => setSingleSongDetails({ ...singleSongDetails, generalGenre: value })} value={singleSongDetails.generalGenre}>
                      <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent className='bg-zinc-900 text-white border-zinc-700'>
                        <SelectItem value="Alternative">Alternative</SelectItem>
                        <SelectItem value="Ambient">Ambient</SelectItem>
                        <SelectItem value="Blues">Blues</SelectItem>
                        <SelectItem value="Classical">Classical</SelectItem>
                        <SelectItem value="Dance">Dance</SelectItem>
                        <SelectItem value="DJ Set">DJ Set</SelectItem>
                        <SelectItem value="Electronic">Electronic</SelectItem>
                        <SelectItem value="Folk">Folk</SelectItem>
                        <SelectItem value="Hip Hop/Rap">Hip Hop/Rap</SelectItem>
                        <SelectItem value="Jazz">Jazz</SelectItem>
                        <SelectItem value="Metal">Metal</SelectItem>
                        <SelectItem value="Pop">Pop</SelectItem>
                        <SelectItem value="Punk">Punk</SelectItem>
                        <SelectItem value="Reggae">Reggae</SelectItem>
                        <SelectItem value="Rock">Rock</SelectItem>
                        <SelectItem value="Singer/Songwriter">Singer/Songwriter</SelectItem>
                        <SelectItem value="Soundtrack">Soundtrack</SelectItem>
                        <SelectItem value="Spoken Word">Spoken Word</SelectItem>
                        <SelectItem value="World">World</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Specific Genre (comma-separated tags)</label>
                    <Input
                      value={singleSongDetails.specificGenres as any as string}
                      onChange={(e) => setSingleSongDetails({ ...singleSongDetails, specificGenres: e.target.value })} // Update state with raw string
                      className='bg-zinc-800 border-zinc-700'
                      placeholder='e.g., Indie Rock, Psychedelic, Garage'
                    />
                  </div>
                </div>
                {/* Add Description field for singles */}
                <div className='space-y-2'>
                  <label htmlFor="single-description" className='text-sm font-medium'>Song Description</label>
                  <textarea
                    id="single-description"
                    value={singleSongDetails.description}
                    onChange={(e) => setSingleSongDetails({ ...singleSongDetails, description: e.target.value })}
                    className='flex h-20 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]'
                    placeholder='Enter song description'
                  />
                </div>
                {/* Add other single song fields here */}
            </div>
          ) : (
            /* Album Form */
            <div className="space-y-4">
               <h3 className="text-lg font-semibold">Album Details</h3>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Album Title</label>
                  <Input
                    value={albumDetails.title}
                    onChange={(e) => setAlbumDetails({ ...albumDetails, title: e.target.value })}
                    className='bg-zinc-800 border-zinc-700'
                    placeholder='Enter album title'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Artist</label>
                  <Select onValueChange={(value) => setAlbumDetails({ ...albumDetails, artistId: value })} value={albumDetails.artistId}>
                    <SelectTrigger className="w-full bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder={loadingArtists ? "Loading artists..." : "Select an artist"} />
                    </SelectTrigger>
                    <SelectContent className='bg-zinc-900 text-white border-zinc-700'>
                      {artists.map(artist => (
                        <SelectItem key={artist._id} value={artist._id}>
                          {artist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className='space-y-2'>
                  <label className='text-sm font-medium'>Release Date</label>
                  <Input
                    type='date'
                    value={albumDetails.releaseDate}
                    onChange={(e) => setAlbumDetails({ ...albumDetails, releaseDate: e.target.value })}
                    className='bg-zinc-800 border-zinc-700'
                  />
                </div>

                {/* Description */}
                <div className='space-y-2'>
                  <label htmlFor="description" className='text-sm font-medium'>Album Description</label>
                  <textarea
                    id="description"
                    value={albumDetails.description}
                    onChange={(e) => setAlbumDetails({ ...albumDetails, description: e.target.value })}
                    className='flex h-20 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]'
                    placeholder='Enter album description'
                  />
                </div>

                {/* New section for additional album files */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold mt-6">Additional Album Files (Photos, PDFs, etc.)</h4>
                  <div
                    className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
                    onClick={() => document.getElementById('additional-album-files-input')?.click()}
                  >
                    <div className='text-center'>
                      <div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
                        <Upload className='h-6 w-6 text-zinc-400' />
                      </div>
                      <div className='text-sm text-zinc-400 mb-2'>
                        {additionalAlbumFiles.length > 0
                          ? `${additionalAlbumFiles.length} file(s) selected`
                          : "Drag and drop or click to select additional files"}
                      </div>
                      <Button variant='outline' size='sm' className='text-xs'>
                        Choose Files
                      </Button>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="additional-album-files-input"
                        onChange={handleAdditionalAlbumFileSelect}
                      />
                    </div>
                  </div>
                  {additionalAlbumFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected Files:</p>
                      <DndContext
                        sensors={sensors} // Use the same sensors as for songs
                        collisionDetection={closestCorners}
                        onDragEnd={handleAdditionalFilesDragEnd}
                        modifiers={modifiers} // Use the same modifiers
                      >
                        <SortableContext
                          items={additionalAlbumFiles.map(file => file.name)} // Use file name as the unique ID
                          strategy={verticalListSortingStrategy}
                        >
                          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                            {additionalAlbumFiles.map((file, index) => (
                              <SortableAdditionalFileItem key={file.name} file={file} index={index} />
                            ))}
                          </ul>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}
                </div>

                {/* Genre Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold mt-6">Genre</h4>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>General Genre</label>
                    <Select onValueChange={(value) => setAlbumDetails({ ...albumDetails, generalGenre: value })}>
                      <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent className='bg-zinc-900 text-white border-zinc-700'>
                        <SelectItem value="Alternative">Alternative</SelectItem>
                        <SelectItem value="Ambient">Ambient</SelectItem>
                        <SelectItem value="Blues">Blues</SelectItem>
                        <SelectItem value="Classical">Classical</SelectItem>
                        <SelectItem value="Dance">Dance</SelectItem>
                        <SelectItem value="DJ Set">DJ Set</SelectItem>
                        <SelectItem value="Electronic">Electronic</SelectItem>
                        <SelectItem value="Folk">Folk</SelectItem>
                        <SelectItem value="Hip Hop/Rap">Hip Hop/Rap</SelectItem>
                        <SelectItem value="Jazz">Jazz</SelectItem>
                        <SelectItem value="Metal">Metal</SelectItem>
                        <SelectItem value="Pop">Pop</SelectItem>
                        <SelectItem value="Punk">Punk</SelectItem>
                        <SelectItem value="Reggae">Reggae</SelectItem>
                        <SelectItem value="Rock">Rock</SelectItem>
                        <SelectItem value="Singer/Songwriter">Singer/Songwriter</SelectItem>
                        <SelectItem value="Soundtrack">Soundtrack</SelectItem>
                        <SelectItem value="Spoken Word">Spoken Word</SelectItem>
                        <SelectItem value="World">World</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Specific Genre (comma-separated tags)</label>
                    <Input
                      value={albumDetails.specificGenres as any as string}
                      onChange={(e) => setAlbumDetails({ ...albumDetails, specificGenres: e.target.value })}
                      className='bg-zinc-800 border-zinc-700'
                      placeholder='e.g., Indie Rock, Psychedelic, Garage'
                    />
                  </div>
                </div>
            </div>
          )}

          {/* Songs in Album section - always show if audio files are selected */}
          {audioFiles.length > 0 && (
            <div className="space-y-4">
               <h4 className="text-lg font-semibold mt-6">Songs in Album</h4>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragEnd={handleDragEnd}
                  modifiers={modifiers}
                >
                  <SortableContext
                    items={albumSongsDetails.map(song => song.title)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul ref={songsListRef} className="space-y-2">
                      {albumSongsDetails.map((song, index) => (
                        <SortableItem key={song.title} song={song} index={index} />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
            </div>
          )}


          <Button onClick={handleSubmit} className='bg-violet-500 hover:bg-violet-600' disabled={isLoading}>
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      )}

      {/* 3. Add Music Videos or Gallery Photos Section */}
      <h3 className="text-lg font-semibold text-white mt-8">3. Add Music Videos or Gallery Photos</h3>
       <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isMediaDragging ? 'border-blue-500 bg-blue-900/20' : 'border-zinc-700 bg-zinc-800/50'
        }`}
        onDragOver={handleMediaDragOver}
        onDragLeave={handleMediaDragLeave}
        onDrop={handleMediaDrop}
      >
        <div className='mb-4'>
          <Upload className='mx-auto h-12 w-12 text-zinc-400' />
        </div>
        <p className='text-zinc-400 mb-4'>Drag and drop video or image files here, or click to select files</p>
        <input type="file" accept="image/*,video/*" className="hidden" id="media-upload-input" onChange={handleMediaFileSelect} ref={mediaFileInputRef} />
        <label htmlFor="media-upload-input" className="cursor-pointer bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded">
          Choose file
        </label>
         {mediaFile && (
          <p className="mt-2 text-sm text-zinc-400">Selected file: {mediaFile.name}</p>
        )}
      </div>

      {mediaFile && (
        <div className="space-y-4">
           <div className='space-y-2'>
            <label className='text-sm font-medium'>Artist</label>
             <Select onValueChange={(value) => setMediaDetails({ ...mediaDetails, artistId: value })} value={mediaDetails.artistId}>
              <SelectTrigger className="w-full bg-zinc-800 border-zinc-700">
                <SelectValue placeholder={loadingArtists ? "Loading artists..." : "Select an artist"} />
              </SelectTrigger>
              <SelectContent className='bg-zinc-900 text-white border-zinc-700'>
                {artists.map(artist => (
                  <SelectItem key={artist._id} value={artist._id}>
                    {artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className='space-y-2'>
             <label className='text-sm font-medium'>Name</label>
             <Input
               value={mediaDetails.name}
               onChange={(e) => setMediaDetails({ ...mediaDetails, name: e.target.value })}
               className='bg-zinc-800 border-zinc-700'
               placeholder='Enter media name'
             />
           </div>
           <div className='space-y-2'>
            <label htmlFor="media-description" className='text-sm font-medium'>Description</label>
             <textarea
              id="media-description"
              value={mediaDetails.description}
              onChange={(e) => setMediaDetails({ ...mediaDetails, description: e.target.value })}
              className='flex h-20 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]'
              placeholder='Enter description'
            />
          </div>
           <Button onClick={handleMediaSubmit} className='bg-violet-500 hover:bg-violet-600' disabled={isMediaLoading}>
            {isMediaLoading ? 'Uploading Media...' : 'Upload Media'}
          </Button>
        </div>
      )}

    </div>
  );
};

export default UploadArea;
