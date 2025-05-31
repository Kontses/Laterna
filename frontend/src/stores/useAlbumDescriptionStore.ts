import { create } from 'zustand';
import { useQueueStore } from './useQueueStore';

interface AlbumDescriptionState {
  showAlbumDescription: boolean;
  albumDescription: string;
  setAlbumDescription: (description: string) => void;
  toggleAlbumDescription: (description?: string) => void;
}

export const useAlbumDescriptionStore = create<AlbumDescriptionState>((set) => ({
  showAlbumDescription: false,
  albumDescription: "",
  setAlbumDescription: (description) => set({ albumDescription: description }),
  toggleAlbumDescription: (description) => {
    const { showQueue, toggleQueue } = useQueueStore.getState();
    if (description !== undefined) {
      set({ albumDescription: description });
    }
    if (!useAlbumDescriptionStore.getState().showAlbumDescription && description !== undefined && showQueue) {
      toggleQueue();
    }
    set(state => ({ showAlbumDescription: !state.showAlbumDescription }));
  },
}));
