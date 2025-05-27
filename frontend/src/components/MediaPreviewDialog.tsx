import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface MediaPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null; // Allow fileUrl to be null
  fileType: 'image' | 'pdf' | null;
}

const MediaPreviewDialog: React.FC<MediaPreviewDialogProps> = ({ isOpen, onClose, fileUrl, fileType }) => {
  const [previewContent, setPreviewContent] = useState<JSX.Element | null>(null);

  useEffect(() => {
    if (isOpen && fileUrl && fileType) {
      if (fileType === 'image') {
        setPreviewContent(<img src={fileUrl} alt="Media Preview" className="max-w-full max-h-[80vh] object-contain mx-auto" />);
      } else if (fileType === 'pdf') {
        setPreviewContent(
          <iframe src={fileUrl} width="100%" height="80vh" style={{ border: 'none' }}>
            This browser does not support PDFs. Please download the PDF to view it: <a href={fileUrl}>Download PDF</a>
          </iframe>
        );
      } else {
        setPreviewContent(<p>Unsupported file type for preview.</p>);
      }
    } else {
      setPreviewContent(null);
    }
  }, [isOpen, fileUrl, fileType]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-zinc-900 border-zinc-700 p-6">
        {previewContent}
      </DialogContent>
    </Dialog>
  );
};

export default MediaPreviewDialog;
