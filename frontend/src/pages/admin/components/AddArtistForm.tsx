import React, { useState, useRef } from 'react'; // Import useRef
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { Upload } from "lucide-react"; // Import Upload icon

interface AddArtistFormProps {
  onArtistAdded: () => void;
  onCancel: () => void; // Add onCancel prop
}

const AddArtistForm: React.FC<AddArtistFormProps> = ({ onArtistAdded, onCancel }) => {
  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null); // Change to File
  const [about, setAbout] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Add isDragging state
  const fileInputRef = useRef<HTMLInputElement>(null); // Add fileInputRef

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto); // Append file
    }
    formData.append('about', about);

    try {
      await axiosInstance.post("/api/admin/artists", formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set content type for file upload
        },
      });
      toast.success("Artist created successfully!");
      setName('');
      setProfilePhoto(null);
      setAbout('');
      onArtistAdded(); // Notify parent component
    } catch (error: any) {
      console.error("Error creating artist:", error);
      toast.error("Failed to create artist: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    } else {
      setProfilePhoto(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      setProfilePhoto(files[0]);
    }
  };


  return (
    <div className="bg-zinc-900 text-white border border-zinc-800 rounded-md p-6 mb-4">
      <h2 className="text-xl font-bold mb-4">Add New Artist</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-4 items-center gap-4 py-4"> {/* Adjusted grid */}
        <Label htmlFor="name" className="text-right text-zinc-400">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3 bg-zinc-800 border-zinc-700 text-white"
          required
        />

        <Label htmlFor="profilePhoto" className="text-right text-zinc-400">
          Profile Photo
        </Label>
        <div
          className={`col-span-3 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
            isDragging ? 'border-blue-500 bg-blue-900/20' : 'border-zinc-700 bg-zinc-800/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          <div className='mb-2'>
            <Upload className='mx-auto h-10 w-10 text-zinc-400' />
          </div>
          <p className='text-zinc-400 text-sm mb-2'>Drag and drop image here, or click to select file</p>
          {profilePhoto && <p className="text-sm text-zinc-300">{profilePhoto.name}</p>}
        </div>

        <Label htmlFor="about" className="text-right text-zinc-400">
          About
        </Label>
        <Textarea
          id="about"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className="col-span-3 bg-zinc-800 border-zinc-700 text-white"
        />

        {/* Buttons aligned with inputs */}
        <div className="col-start-2 col-span-3 flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Artist'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddArtistForm;
