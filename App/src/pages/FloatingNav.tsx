"use client";

import {
	HomeIcon,
	Clock3,
	UserPen,
} from "lucide-react";
// import Link from "next/link";
import React from "react";

// import { ModeToggle } from "../components/magicui/mode-toggle";
import { buttonVariants } from "../components/ui/button";
// import { Separator } from "../components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../components/ui/tooltip";
import { cn } from "../lib/utils";
import { Dock, DockIcon } from "../components/magicui/dock";
import { Link } from "react-router-dom";

export type IconProps = React.HTMLAttributes<SVGElement>;

const Icons = {
	home: (props: IconProps) => <HomeIcon {...props} />,
    history: (props: IconProps) => <Clock3 {...props} />,
    profile: (props: IconProps) => <UserPen {...props} />,
    
	
};

const DATA = {
	navbar: [
		{ href: "#", icon: HomeIcon, label: "Home" },
		{ href: "#", icon: Clock3, label: "History" },
		{ href: "#", icon: UserPen, label: "Profile" },
	]
};
export function FloatingNav() {
	return (
		<div className="fixed bottom-0 md:bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
			<TooltipProvider>
				<Dock direction="middle" className="gap-4">
					{DATA.navbar.map((item) => (
						<DockIcon key={item.label}>
							<Tooltip>
								<TooltipTrigger asChild>
									<Link
										to={item.href}
										aria-label={item.label}
										className={cn(
											buttonVariants({ variant: "ghost", size: "icon" }),
											"size-12 rounded-md bg-white/80 backdrop-blur-md shadow-lg hover:shadow-gray-700"
										)}
									>
										<item.icon className="size-4 text-black" />
									</Link>
								</TooltipTrigger>
								<TooltipContent>
									<p>{item.label}</p>
								</TooltipContent>
							</Tooltip>
						</DockIcon>
					))}
				</Dock>
			</TooltipProvider>
		</div>
	);
}
