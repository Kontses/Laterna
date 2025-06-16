import { create } from 'zustand';
import { useAlbumDescriptionStore } from './useAlbumDescriptionStore';

interface QueueState {
  showQueue: boolean;
  toggleQueue: () => void;
  setShowQueue: (show: boolean) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  showQueue: false,
  toggleQueue: () => set((state) => {
    const { showAlbumDescription, toggleAlbumDescription } = useAlbumDescriptionStore.getState();
    if (!state.showQueue && showAlbumDescription) {
      toggleAlbumDescription();
    }
    return ({ showQueue: !state.showQueue });
  }),
  setShowQueue: (show: boolean) => set({ showQueue: show }),
})); 