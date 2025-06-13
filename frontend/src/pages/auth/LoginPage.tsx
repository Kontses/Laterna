import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await axiosInstance.post("/auth/login", { email, password });
			localStorage.setItem("token", response.data.token);
			// Optionally, store user data in a global state management (e.g., zustand)
			toast.success("Logged in successfully!");
			navigate("/");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Login failed");
		}
	};

	return (
		<div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-xl z-50">
			<Card className="w-[90%] max-w-md border-zinc-800 text-white">
				<CardHeader className="text-center">
					<CardTitle className="text-3xl font-bold">Login</CardTitle>
					<CardDescription className="text-zinc-400">Welcome back! Please sign in to your account.</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-violet-500"
							required
						/>
						<Input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-violet-500"
							required
						/>
						<Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-md transition-colors">
							Login
						</Button>
					</form>
					<p className="text-center text-zinc-400 mt-4 text-sm">
						Don't have an account?{" "}
						<Link to="/register" className="text-violet-400 hover:underline">Sign Up</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default LoginPage; 