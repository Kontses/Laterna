import { create } from 'zustand';

interface AlbumDescriptionState {
  showAlbumDescription: boolean;
  albumDescription: string;
  setAlbumDescription: (description: string) => void;
  toggleAlbumDescription: (description?: string) => void;
}

export const useAlbumDescriptionStore = create<AlbumDescriptionState>((set, get) => ({
  showAlbumDescription: false,
  albumDescription: "",
  setAlbumDescription: (description) => set({ albumDescription: description }),
  toggleAlbumDescription: (description) => {
    if (description !== undefined) {
      set({ albumDescription: description });
    }
    set(state => ({ showAlbumDescription: !state.showAlbumDescription }));
  },
}));
