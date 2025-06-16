import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import MainLayout from "./layout/MainLayout";
import ChatPage from "./pages/chat/ChatPage";
import AlbumPage from "./pages/album/AlbumPage";
import ArtistPage from "./pages/artist/ArtistPage";
import AdminPage from "./pages/admin/AdminPage";
import AboutPage from "./pages/about/AboutPage";
import LibraryPage from "./pages/library/LibraryPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/profile/ProfilePage";
import PlaylistPage from "./pages/playlist/PlaylistPage";

import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/404/NotFoundPage";

function App() {
	const location = useLocation();
	// Check if the current path is for login or register
	const isAuthPath = location.pathname === "/login" || location.pathname === "/register";

	return (
		<div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
			<Routes>
				{/* Main application content, always rendered */}
				<Route element={<MainLayout />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/chat' element={<ChatPage />} />
					<Route path='/albums/:albumId' element={<AlbumPage />} />
					<Route path='/artists/:artistId' element={<ArtistPage />} />
					<Route path='/admin' element={<AdminPage />} />
					<Route path='/about' element={<AboutPage />} />
					<Route path='/library' element={<LibraryPage />} />
					<Route path='/playlists/:id' element={<PlaylistPage />} />
					<Route path='/profile' element={<ProfilePage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Route>
			</Routes>

			{/* Render Login/Register as an overlay if the path matches */}
			{isAuthPath && (
				<>
					{location.pathname === "/login" && <LoginPage />}
					{location.pathname === "/register" && <RegisterPage />}
				</>
			)}

			<Toaster />
		</div>
	);
}

export default App;
