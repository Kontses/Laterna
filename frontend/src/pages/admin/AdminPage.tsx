import { useAuthStore } from "@/stores/useAuthStore";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import UploadArea from "./components/UploadArea"; // Import the new component
import AddArtistForm from "./components/AddArtistForm"; // Import AddArtistForm
import { Button } from "@/components/ui/button"; // Import Button
import { useEffect, useState } from "react"; // Import useState
import { useMusicStore } from "@/stores/useMusicStore";

const AdminPage = () => {
	const { isAdmin, isLoading } = useAuthStore();
	const [showAddArtistForm, setShowAddArtistForm] = useState(false); // State to control form visibility

	const { fetchAlbums, fetchSongs, fetchStats, fetchArtists } = useMusicStore(); // Destructure fetchArtists

	useEffect(() => {
		fetchAlbums();
		fetchSongs();
		fetchStats();
		fetchArtists(); // Fetch artists on component mount
	}, [fetchAlbums, fetchSongs, fetchStats, fetchArtists]);

	if (!isAdmin && !isLoading) return <div>Unauthorized</div>;

	return (
		<div
			className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900
   to-black text-zinc-100 p-8'
		>
			<Header />

			<DashboardStats />

			{/* Add Artist Button or Form */}
			<h3 className="text-lg font-semibold text-white mb-4">1. Create a new Artist profile that doesn't exist</h3>
			<div className="mb-4">
				{!showAddArtistForm && (
					<Button
						className="bg-purple-600 text-white hover:bg-purple-700"
						onClick={() => setShowAddArtistForm(true)}
					>
						Add New Artist
					</Button>
				)}
				{showAddArtistForm && (
					<AddArtistForm
						onArtistAdded={() => {
							fetchArtists(); // Refresh artist list after adding a new artist
							setShowAddArtistForm(false); // Hide form after adding
						}}
						onCancel={() => setShowAddArtistForm(false)} // Hide form on cancel
					/>
				)}
			</div>

			{/* Replace Tabs with UploadArea */}
			<UploadArea />
		</div>
	);
};
export default AdminPage;
