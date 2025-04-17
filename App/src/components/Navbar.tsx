import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlignJustifyIcon } from "lucide-react";
import { UserButton, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom"; 

//updated 
const Navbar = () => {
	const navigate = useNavigate();
	const { userId, signOut } = useAuth(); // Import logout function
	console.log("UseID : ",userId);
	const [currentUserId,setcurrentUserId]=useState();
	console.log(currentUserId);
	
	const backend_url = import.meta.env.VITE_BACKEND_URL;
	useEffect(()=>{
		if(!userId) return;
			fetch(`${backend_url}/users/get-current-user?clerkUserId=${userId}`)
				.then((res) => res.json())
				.then((data) => {
					console.log("Fetched user data 1 :", data);
					if (data.user) {
						console.log("CurrentPhone", data.user.phone);

						setcurrentUserId(data.user.phone);
					}
				})
				.catch((error) => {
					console.error("Error fetching user data:", error);
				});
				
			
		},[userId])

	return (
		<div className="absolute top-4 right-4 z-50">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="bg-black text-white">
						<AlignJustifyIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem>
							<div className="flex items-center justify-between w-full flex-row">
								<UserButton  showName/>
								{/* <span className="ml-2">User</span> */}
							</div>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => navigate(`/allchat/${currentUserId}`)}>
							All Chats
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default Navbar;
