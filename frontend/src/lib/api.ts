import { axiosInstance } from "./axios";
import { Album, Playlist, Song } from "@/types";

export const getPlaylistById = async (id: string): Promise<Playlist & { songs: Song[] }> => {
    const response = await axiosInstance.get(`/playlists/${id}`);
    return response.data;
};

export const getAlbumById = async (id: string): Promise<Album & { songs: Song[] }> => {
    const response = await axiosInstance.get(`/albums/${id}`);
    return response.data;
}; 