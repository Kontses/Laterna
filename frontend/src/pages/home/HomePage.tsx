import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useUser } from "@clerk/clerk-react";

const HomePage = () => {
	const {
		fetchFeaturedSongs,
		fetchMadeForYouSongs,
		fetchTrendingSongs,
		isLoading,
		madeForYouSongs,
		featuredSongs,
		trendingSongs,
	} = useMusicStore();

	const { initializeQueue } = usePlayerStore();
	const { user } = useUser();
	const [greeting, setGreeting] = useState("");
	const [greetingEmoji, setGreetingEmoji] = useState<string>("");

	useEffect(() => {
		const getGreeting = () => {
			const hour = new Date().getHours();
			if (hour >= 0 && hour < 13) {
				setGreetingEmoji("☀️");
				return "Good morning";
			} else if (hour >= 13 && hour < 17) {
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
		if (madeForYouSongs.length > 0 && featuredSongs.length > 0 && trendingSongs.length > 0) {
			const allSongs = [...featuredSongs, ...madeForYouSongs, ...trendingSongs];
			initializeQueue(allSongs);
		}
	}, [initializeQueue, madeForYouSongs, trendingSongs, featuredSongs]);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<h1 className='text-2xl sm:text-3xl font-bold mb-6'>
						{greeting}
						{user?.username ? ` ${user.username}!` : "!"} {greetingEmoji}
					</h1>
					<FeaturedSection />

					<div className='space-y-8'>
						<SectionGrid title='Made For You' songs={madeForYouSongs} isLoading={isLoading} />
						<SectionGrid title='Trending' songs={trendingSongs} isLoading={isLoading} />
					</div>
				</div>
			</ScrollArea>
		</main>
	);
};
export default HomePage;
