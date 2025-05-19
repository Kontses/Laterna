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

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);
	const { showAlbumDescription, albumDescription } = useAlbumDescriptionStore(); // Use state from the store

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<div className='h-screen bg-black text-white flex flex-col'>
			<Topbar /> {/* Add Topbar here */}
			<ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
				<AudioPlayer />
				{/* left sidebar */}
				<ResizablePanel defaultSize={20} minSize={isMobile ? 0 : 10} maxSize={30}>
					<LeftSidebar />
				</ResizablePanel>

				<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

				{/* Main content */}
				<ResizablePanel defaultSize={isMobile ? 80 : 60}>
					<Outlet /> {/* Removed context prop */}
				</ResizablePanel>

				{!isMobile && (
					<>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

						{/* right sidebar */}
						<ResizablePanel defaultSize={showAlbumDescription ? 25 : 20} minSize={0} maxSize={showAlbumDescription ? 30 : 25} collapsedSize={0}>
							{showAlbumDescription && albumDescription ? (
								<AlbumDescriptionPanel description={albumDescription} />
							) : (
								<FriendsActivity />
							)}
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>

			{/* PlaybackControls will get toggle function from the store */}
			<PlaybackControls />
		</div>
	);
};
export default MainLayout;
