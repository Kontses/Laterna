import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useRecentPlaysStore } from "@/stores/useRecentPlaysStore";
import RecentPlaysGrid from "./components/RecentPlaysGrid"; // Import RecentPlaysGrid
import ArtistGrid from "./components/ArtistGrid"; // Import ArtistGrid
import AlbumGrid from "./components/AlbumGrid"; // Import AlbumGrid
import { useAuth } from "@/providers/AuthProvider"; // Import useAuth

const HomePage = () => {
	const {
		isLoading,
		featuredSongs,
		trendingSongs,
		artists,
		fetchArtists,
		albums, // Add albums
		fetchAlbums, // Add fetchAlbums
	} = useMusicStore();

	const { initializeQueue } = usePlayerStore();
	const { user } = useAuth(); // Use custom useAuth hook
	const [greeting, setGreeting] = useState("");
	const [greetingEmoji, setGreetingEmoji] = useState<string>("");

	const { recentPlays, fetchRecentPlays, isLoading: isRecentPlaysLoading } = useRecentPlaysStore();

	useEffect(() => {
		const getGreeting = () => {
			const hour = new Date().getHours();
			if (hour >= 0 && hour < 12) {
				setGreetingEmoji("☀️");
				return "Good morning";
			} else if (hour >= 12 && hour < 18) {
				setGreetingEmoji("🌤️");
				return "Good afternoon";
			} else {
				setGreetingEmoji("🌙");
				return "Good evening";
			}
		};
		setGreeting(getGreeting());
	}, []);

	useEffect(() => {
		if (user) {
			fetchRecentPlays();
		}
	}, [fetchRecentPlays, user]); // Removed isLoaded and isSignedIn

	useEffect(() => {
		if (user) {
			fetchArtists();
		}
	}, [fetchArtists, user]); // Removed isLoaded

	useEffect(() => {
		if (user) {
			fetchAlbums(); // Fetch albums
		}
	}, [fetchAlbums, user]); // Removed isLoaded and isSignedIn

	// Sort artists by _id (assuming _id contains a timestamp for creation order)
	const sortedArtists = [...artists].sort((a, b) => b._id.localeCompare(a._id));

	// Sort albums by releaseDate (most recent first)
	const sortedAlbums = [...albums].sort((a, b) => {
		const dateA = new Date(a.releaseDate).getTime();
		const dateB = new Date(b.releaseDate).getTime();
		return dateB - dateA;
	});

	useEffect(() => {
		if (featuredSongs.length > 0 && trendingSongs.length > 0) {
			const allSongs = [...featuredSongs, ...trendingSongs];
			initializeQueue(allSongs);
		}
	}, [initializeQueue, trendingSongs, featuredSongs]);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-700 to-zinc-800'>
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<h1 className='text-2xl sm:text-3xl font-bold mb-6'>
						{greeting}
						{user?.nickname ? ` ${user.nickname}!` : "!"} {greetingEmoji}
					</h1>
					{/* Display Recent Plays Grid */}
					<div className="mb-8">
						<RecentPlaysGrid songs={recentPlays} isLoading={isRecentPlaysLoading} />
					</div>
					<FeaturedSection />

					<div className='space-y-8'>
						<AlbumGrid
							title='New Albums'
							albums={sortedAlbums.slice(0, 4)}
							isLoading={isLoading}
							showAllLink={{ to: '/library', state: { viewMode: 'albums', sortOption: 'newest' } }}
						/>
						<ArtistGrid
							title='New Artists'
							artists={sortedArtists.slice(0, 4)}
							isLoading={isLoading}
							showAllLink={{ to: '/library', state: { viewMode: 'artists', sortOption: 'newest' } }}
						/>
					</div>
				</div>
			</ScrollArea>
		</main>
	);
};
export default HomePage;
