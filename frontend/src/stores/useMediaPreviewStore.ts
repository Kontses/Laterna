import { create } from 'zustand';

interface MediaPreviewState {
  isOpen: boolean;
  fileUrl: string | null;
  fileType: 'image' | 'pdf' | null;
  openPreview: (url: string, type: 'image' | 'pdf') => void;
  closePreview: () => void;
}

export const useMediaPreviewStore = create<MediaPreviewState>((set) => ({
  isOpen: false,
  fileUrl: null,
  fileType: null,
  openPreview: (url, type) => set({ isOpen: true, fileUrl: url, fileType: type }),
  closePreview: () => set({ isOpen: false, fileUrl: null, fileType: null }),
}));
