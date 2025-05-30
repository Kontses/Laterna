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
	const [artistListVersion, setArtistListVersion] = useState(0); // New state for artist list version

	const { fetchAlbums, fetchSongs, fetchStats, fetchArtists } = useMusicStore(); // Destructure fetchArtists

	useEffect(() => {
		fetchAlbums();
		fetchSongs();
		fetchStats();
		// fetchArtists(); // Initial fetch is now handled by UploadArea's useEffect
	}, [fetchAlbums, fetchSongs, fetchStats]);

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
							setArtistListVersion(prev => prev + 1); // Increment state to trigger UploadArea refetch
							setShowAddArtistForm(false);
						}}
						onCancel={() => setShowAddArtistForm(false)} // Hide form on cancel
					/>
				)}
			</div>

			{/* Pass artistListVersion to UploadArea */}
			<UploadArea artistListVersion={artistListVersion} />
		</div>
	);
};
export default AdminPage;
