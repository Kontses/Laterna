import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FastAverageColor } from 'fast-average-color';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [gradientColor, setGradientColor] = useState<string>("rgb(24,24,27)");

    const fac = new FastAverageColor();

    useEffect(() => {
        if (user) {
            setNickname(user.nickname || "");
            setEmail(user.email || "");
            setImageUrl(user.imageUrl || "");
        }
    }, [user]);

    useEffect(() => {
        const extractColor = async () => {
            if (imageUrl) {
                try {
                    const color = await fac.getColorAsync(imageUrl);
                    setGradientColor(color.rgba);
                } catch (error) {
                    console.error("Error extracting color:", error);
                    setGradientColor("rgb(24,24,27)");
                }
            } else {
                setGradientColor("rgb(24,24,27)");
            }
        };
        extractColor();
    }, [imageUrl]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let newImageUrl = imageUrl; // Default to current imageUrl

            // If a new file is selected, upload it first
            if (fileInputRef.current?.files && fileInputRef.current.files[0]) {
                const file = fileInputRef.current.files[0];
                const formData = new FormData();
                formData.append('image', file); // 'image' must match the field name in upload.controller.js

                const uploadResponse = await axiosInstance.post('/upload/image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                newImageUrl = uploadResponse.data.imageUrl; // Get the Cloudinary URL
            }

            const updatedUser = { nickname, imageUrl: newImageUrl };
            const response = await axiosInstance.put(`/users/${user?._id}`, updatedUser);
            setUser(response.data);
            toast.success("Profile updated successfully!");
            // Reset the file input after successful upload and profile update
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
            console.error("Profile update failed:", error);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            await axiosInstance.put(`/api/users/${user?._id}/password`, { password });
            toast.success("Password updated successfully!");
            setPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update password");
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div 
            className='h-full w-full relative overflow-hidden'
            style={{ 
                backgroundColor: gradientColor, 
                backgroundImage: `linear-gradient(to bottom, ${gradientColor}, rgb(24,24,27) 70%)` 
            }}
        >
            <ScrollArea className="h-full p-4 sm:p-6">
                <div className="mx-auto max-w-2xl space-y-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white">User Profile</h1>
                        <p className="text-zinc-400">Manage your account information</p>
                    </div>
                    
                    <div className="flex flex-col items-center p-6 bg-zinc-900/70 rounded-md shadow-lg">
                        <div className="relative mb-6 cursor-pointer" onClick={handleImageClick}>
                            <Avatar className="w-24 h-24 mb-4">
                                {user?.imageUrl && <AvatarImage src={imageUrl} alt={user.nickname || "User"} className="object-cover" />}
                                <AvatarFallback className="bg-violet-600 text-white text-4xl">
                                    {user?.nickname ? user.nickname.charAt(0).toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => setImageUrl(e.target.files && e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : "")} // Update imageUrl for local preview
                                className="hidden"
                                accept="image/*"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-full">
                                <span className="text-white text-sm">Change</span>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4 mb-8 w-full">
                            <h3 className="text-xl font-semibold text-white">Profile Details</h3>
                            <Input
                                type="text"
                                placeholder="Nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-violet-500"
                                required
                            />
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-violet-500"
                                disabled
                            />
                            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-md transition-colors">
                                Update Profile
                            </Button>
                        </form>

                        <form onSubmit={handlePasswordUpdate} className="space-y-4 w-full">
                            <h3 className="text-xl font-semibold text-white">Change Password</h3>
                            <Input
                                type="password"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-violet-500"
                                required
                                autoComplete="new-password"
                            />
                            <Input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-violet-500"
                                required
                                autoComplete="new-password"
                            />
                            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-md transition-colors">
                                Change Password
                            </Button>
                        </form>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};

export default ProfilePage; 