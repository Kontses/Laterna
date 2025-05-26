import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddArtistForm from './AddArtistForm'; // Import AddArtistForm

interface AddArtistDialogProps {
  onArtistAdded: () => void;
}

const AddArtistDialog: React.FC<AddArtistDialogProps> = ({ onArtistAdded }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleArtistAdded = () => {
    setIsOpen(false); // Close dialog on successful artist creation
    onArtistAdded();
  };

  const handleCancel = () => {
    setIsOpen(false); // Close dialog on cancel
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Artist</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 text-white border-zinc-800"> {/* Adjusted max-w */}
        <DialogHeader>
          <DialogTitle className="text-white">Add New Artist</DialogTitle>
        </DialogHeader>
        <AddArtistForm onArtistAdded={handleArtistAdded} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
};

export default AddArtistDialog;
