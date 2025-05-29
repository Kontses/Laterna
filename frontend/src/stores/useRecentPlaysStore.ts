import { create } from "zustand";
import { Song } from "@/types";
import { axiosInstance } from "@/lib/axios";

interface RecentPlaysStore {
	recentPlays: Song[];
	isLoading: boolean;
	error: string | null;
	fetchRecentPlays: () => Promise<void>;
}

export const useRecentPlaysStore = create<RecentPlaysStore>((set) => ({
	recentPlays: [],
	isLoading: false,
	error: null,

	fetchRecentPlays: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/users/recent-plays");
			set({ recentPlays: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},
}));
