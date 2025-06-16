import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Playlist } from "@/types";

interface PlaylistEditFormProps {
  playlist: Playlist;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlaylist: Partial<Playlist>) => void;
}

const PlaylistEditForm: React.FC<PlaylistEditFormProps> = ({ playlist, isOpen, onClose, onSave }) => {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || "");
  const [isPublic, setIsPublic] = useState(playlist.isPublic);

  useEffect(() => {
    setName(playlist.name);
    setDescription(playlist.description || "");
    setIsPublic(playlist.isPublic);
  }, [playlist]);

  const handleSubmit = () => {
    onSave({
      name,
      description,
      isPublic,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className='sm:max-w-[425px]'
        onKeyDown={(e) => {
          const target = e.target as HTMLElement;
          if (e.key === ' ' && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            e.stopPropagation();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Playlist</DialogTitle>
          <DialogDescription>
            Make changes to your playlist here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='description' className='text-right'>
              Description
            </Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='public' className='text-right'>
              Public
            </Label>
            <Switch
              id='public'
              checked={isPublic}
              onCheckedChange={setIsPublic}
              className='col-span-3'
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='submit' onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistEditForm; 