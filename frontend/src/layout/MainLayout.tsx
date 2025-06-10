import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import FriendsActivity from "./components/FriendsActivity";
import AudioPlayer from "./components/AudioPlayer";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useState } from "react";
import AlbumDescriptionPanel from "./components/AlbumDescriptionPanel"; // Import the new component
import { useAlbumDescriptionStore } from "@/stores/useAlbumDescriptionStore"; // Import the store
import Topbar from "@/components/Topbar"; // Import Topbar
import { useQueueStore } from "@/stores/useQueueStore"; // Import the queue store
import Queue from "@/components/Queue"; // Import the Queue component

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);
	const { showAlbumDescription, albumDescription } = useAlbumDescriptionStore(); // Get toggle function
	const { showQueue } = useQueueStore(); // Get toggle function

	// New state to manage active right panel
	const [activeRightPanel, setActiveRightPanel] = useState<'queue' | 'albumDescription' | 'friendsActivity'>('friendsActivity');

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Effect to update active panel based on store states
	useEffect(() => {
		if (showQueue) {
			setActiveRightPanel('queue');
		} else if (showAlbumDescription) {
			setActiveRightPanel('albumDescription');
		} else {
			setActiveRightPanel('friendsActivity');
		}
	}, [showQueue, showAlbumDescription]);


	return (
		<div className='h-screen bg-black text-white flex flex-col'>
			<Topbar /> {/* Add Topbar here */}
			<ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
				<AudioPlayer />
				{/* left sidebar */}
				<ResizablePanel defaultSize={20} minSize={isMobile ? 0 : 10} maxSize={30} className="overflow-y-auto">
					<LeftSidebar />
				</ResizablePanel>

				<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

				{/* Main content */}
				<ResizablePanel defaultSize={isMobile ? 80 : 60} className="overflow-y-auto">
					<Outlet /> {/* Removed context prop */}
				</ResizablePanel>

				{!isMobile && (
					<>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

						{/* right sidebar - includes Queue, Album Description, Friends Activity */}
						<ResizablePanel defaultSize={activeRightPanel !== 'friendsActivity' ? 25 : 20} minSize={0} maxSize={activeRightPanel !== 'friendsActivity' ? 30 : 25} collapsedSize={0}>
							{/* Conditional Rendering for Right Panel Content based on activeRightPanel */}
							{activeRightPanel === 'queue' ? (
								<Queue />
							) : activeRightPanel === 'albumDescription' && albumDescription ? (
								<AlbumDescriptionPanel description={albumDescription} />
							) : (
								<FriendsActivity />
							)}
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>

			{/* Pass callbacks to PlaybackControls and AlbumDescriptionPanel to control activeRightPanel */}
			<PlaybackControls 
				onToggleQueue={() => setActiveRightPanel(prev => prev === 'queue' ? 'friendsActivity' : 'queue')} 
				onToggleAlbumDescription={() => setActiveRightPanel(prev => prev === 'albumDescription' ? 'friendsActivity' : 'albumDescription')} 
				onToggleFriendsActivity={() => setActiveRightPanel(prev => prev === 'friendsActivity' ? 'friendsActivity' : 'friendsActivity')} // Callback for Friends Activity
			/>
		</div>
	);
};
export default MainLayout;
