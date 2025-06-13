import { LayoutDashboardIcon, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Topbar = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const { isAdmin } = useAuthStore();
	const { logout, user } = useAuth();
	const isAuthenticated = !!localStorage.getItem("token");

	console.log({ isAdmin });

	useEffect(() => {
		if (searchTerm) {
			// Call the search API here
			console.log("Searching for:", searchTerm);
		}
	}, [searchTerm]);

	return (
		<div
			className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75
      backdrop-blur-md z-10
    '
		>
			<Link to='/about' className='flex gap-2 items-center'>
				<img src='/laternalogo.png' className='size-8' alt='Laterna logo' />
				Laterna
			</Link>
			<div className="relative flex-grow max-w-md rounded-full hover:shadow-[0_0_10px_rgba(255,190,255,0.8)] transition-all duration-200">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-zinc-400" />
				<Input
					type="text"
					placeholder="What do you want to play?"
					className="w-full pl-10 pr-4 py-2 rounded-full bg-zinc-800 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>
			<div className='flex items-center gap-4'>
				{isAuthenticated && (
					<Link to={'/profile'} className="cursor-pointer">
						<Avatar className="w-8 h-8">
							{user?.imageUrl && <AvatarImage src={user.imageUrl} alt={user.nickname || "User"} />}
							<AvatarFallback className="bg-violet-600 text-white">
								{user?.nickname ? user.nickname.charAt(0).toUpperCase() : "U"}
							</AvatarFallback>
						</Avatar>
					</Link>
				)}
				{isAdmin && (
					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }))}>
						<LayoutDashboardIcon className='size-4  mr-2' />
						Admin Dashboard
					</Link>
				)}

				{isAuthenticated ? (
					<Button onClick={logout} variant={"ghost"} className="text-white">
						Logout
					</Button>
				) : (
					<Link to="/login" className={cn(buttonVariants({ variant: "outline" }))}>
						Login
					</Link>
				)}
			</div>
		</div>
	);
};
export default Topbar;
