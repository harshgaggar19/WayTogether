import React from "react";
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

const Navbar = () => {
	const { signOut } = useAuth(); // Import logout function

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
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default Navbar;
