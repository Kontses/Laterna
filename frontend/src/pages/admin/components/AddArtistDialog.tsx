import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

interface AddArtistDialogProps {
  onArtistAdded: () => void;
}

const AddArtistDialog: React.FC<AddArtistDialogProps> = ({ onArtistAdded }) => {
  const [name, setName] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [about, setAbout] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/api/admin/artists", {
        name,
        profilePhotoUrl,
        about,
      });
      toast.success("Artist created successfully!");
      setName('');
      setProfilePhotoUrl('');
      setAbout('');
      setIsOpen(false);
      onArtistAdded(); // Notify parent component
    } catch (error: any) {
      console.error("Error creating artist:", error);
      toast.error("Failed to create artist: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Artist</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Artist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
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
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profilePhotoUrl" className="text-right text-zinc-400">
              Photo URL
            </Label>
            <Input
              id="profilePhotoUrl"
              value={profilePhotoUrl}
              onChange={(e) => setProfilePhotoUrl(e.target.value)}
              className="col-span-3 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="about" className="text-right text-zinc-400">
              About
            </Label>
            <Textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="col-span-3 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <Button type="submit" className="mt-4 bg-green-500 hover:bg-green-600 text-black" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Artist'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddArtistDialog;
