import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState, useCallback } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useRecentPlaysStore } from "@/stores/useRecentPlaysStore";
import RecentPlaysGrid from "./components/RecentPlaysGrid"; // Import RecentPlaysGrid
import ArtistGrid from "./components/ArtistGrid"; // Import ArtistGrid
import AlbumGrid from "./components/AlbumGrid"; // Import AlbumGrid
import { useAuth } from "@/providers/AuthProvider"; // Import useAuth
import { FastAverageColor } from 'fast-average-color';

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
	const [gradientColor, setGradientColor] = useState<string>("rgb(24,24,27)"); // Default gradient color

	const { recentPlays, fetchRecentPlays, isLoading: isRecentPlaysLoading } = useRecentPlaysStore();

	const fac = new FastAverageColor();

	const handleImageHover = useCallback(async (imageUrl: string | null) => {
		if (imageUrl) {
			try {
				const color = await fac.getColorAsync(imageUrl);
				setGradientColor(color.rgba);
			} catch (error) {
				console.error("Error extracting color on hover:", error);
				setGradientColor("rgb(24,24,27)"); // Fallback to default
			}
		} else {
			setGradientColor("rgb(24,24,27)"); // Reset to default if no image or mouse leaves
		}
	}, [fac]);

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
	}, [fetchRecentPlays, user]);

	useEffect(() => {
		fetchArtists();
	}, [fetchArtists]);

	useEffect(() => {
		fetchAlbums(); // Fetch albums
	}, [fetchAlbums]);

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
		<main
			className='rounded-md overflow-hidden h-full transition-colors duration-1000'
			style={{
				backgroundColor: gradientColor,
				backgroundImage: `linear-gradient(to bottom, transparent, rgb(24,24,27) 70%)`,
			}}
		>
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
							onImageHover={handleImageHover} // Pass hover handler
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
