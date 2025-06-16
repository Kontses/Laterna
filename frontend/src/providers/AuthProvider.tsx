import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { Loader } from "lucide-react";
import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types"; // Import User type

interface AuthContextType {
	logout: () => void;
	user: User | null;
	setUser: (user: User | null) => void;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const updateApiToken = (token: string | null) => {
	if (token) axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	else delete axiosInstance.defaults.headers.common["Authorization"];
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null); // Add user state
	const { checkAdminStatus } = useAuthStore();
	const { initSocket, disconnectSocket } = useChatStore();
	const navigate = useNavigate();

	const logout = useCallback(() => {
		localStorage.removeItem("token");
		updateApiToken(null);
		setUser(null); // Clear user state on logout
		disconnectSocket();
		navigate("/login");
	}, [disconnectSocket, navigate]);

	useEffect(() => {
		const initAuth = async () => {
			try {
				const token = localStorage.getItem("token");
				updateApiToken(token);

				if (token) {
					// Fetch user data if token exists (or get from login response in login page)
					// For now, let's assume if token exists, user is authenticated and we'll fetch user data if needed later
					// Or, if login/register responses return user data, pass it to setUser
					// For initial load, we might need a /api/auth/me endpoint or similar
					try {
						const response = await axiosInstance.get("/auth/me"); // Assuming a /auth/me endpoint exists to get current user data
						setUser(response.data); 
						initSocket(response.data._id); // Use actual user ID for socket
					} catch (fetchError) {
						console.error("Failed to fetch user data", fetchError);
						logout(); // Logout if user data cannot be fetched (e.g., invalid token)
					}
					await checkAdminStatus();
				} else {
					setUser(null);
				}
			} catch (error: any) {
				updateApiToken(null);
				console.log("Error in auth provider", error);
			} finally {
				setLoading(false);
			}
		};

		initAuth();

		return () => disconnectSocket();
	}, [initSocket, disconnectSocket, logout]);

	if (loading)
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<Loader className='size-8 text-violet-500 animate-spin' />
			</div>
		);

	return (
		<AuthContext.Provider value={{ logout, user, setUser, isAuthenticated: !!user }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export default AuthProvider;
