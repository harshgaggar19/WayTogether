import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MatchPageMap } from "@/components/MatchPageMap";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

const ViewMatch = () => {
	const { id } = useParams();
	const [userData, setUserData] = useState<any | null>(null);
	const [currUserData, setCurrUserData] = useState<any | null>(null);
	const [roomId, setRoomId] = useState<string | null>(null);

	const [loading, setLoading] = useState(true);
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [mobile, setMobile] = useState<string>("");
	const { user } = useUser();

	useEffect(() => {
		fetch(
			`http://localhost:8080/users/get-current-user?clerkUserId=${user?.id}`
		)
			.then((res) => res.json())
			.then((data) => {
				console.log("Fetched user data:", data);
				if (data.user) {
					setCurrUserData(data.user);
				}
			})
			.catch((error) => {
				console.error("Error fetching user data:", error);
				toast.error("Error fetching current user data");
			});
	}, [user?.id]);
	useEffect(() => {
		if (!id || !user?.id) return;

		setLoading(true);
		fetch(
			`http://localhost:8080/users/get-match-final?clerkUserId=${user?.id}&matchedUserId=${id}`
		)
			.then((res) => res.json())
			.then((data) => {
				console.log("Fetched match data:", data);

				if (data.match) {
					setUserData(data.match);
					setMobile(data.match.matchedUser?.phone);
				} else {
					setUserData(null);
				}

				if (data.match?.matchedUser?.phone && currUserData?.phone) {
					fetch("http://localhost:8080/api/room", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							users: [currUserData.phone, data.match.matchedUser.mobile],
						}),
					})
						.then((res) => res.json())
						.then((roomData) => {
							console.log("Room response:", roomData);
							if (roomData.roomId) {
								setRoomId(roomData.roomId);
								// toast.success("Room created successfully!");
							} else if (roomData) {
								setRoomId(roomData);
							} else {
								toast.error("Error creating room!");
							}
						})
						.catch((err) => console.error("Error sending numbers:", err));
				}
			})
			.catch((error) => {
				console.error("Error fetching matched users:", error);
				setUserData(null);
			})
			.finally(() => setLoading(false));
	}, [id, user?.id, currUserData]);

	if (loading) return <LoadingSpinner />;
	if (!userData)
		return <div className="text-center text-gray-700 p-4">No match found!</div>;

	return (
		<div className="w-screen h-screen flex flex-col">
			{/* Map Container */}
			<div
				className={`flex-grow transition-all ${
					drawerOpen ? "h-1/2" : "h-[85vh]"
				}`}
			>
				<MatchPageMap
					source={
						userData?.source
							? { lat: userData.source[1], lng: userData.source[0] }
							: null
					}
					stop1={
						userData?.stop1
							? { lat: userData.stop1[1], lng: userData.stop1[0] }
							: null
					}
					stop2={
						userData?.stop2
							? { lat: userData.stop2[1], lng: userData.stop2[0] }
							: null
					}
					destination={
						userData?.destination
							? { lat: userData.destination[1], lng: userData.destination[0] }
							: null
					}
				/>
			</div>

			{/* Drawer for Match Details */}
			<Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
				<DrawerContent className="h-[50vh] transition-all">
					<div className="w-full h-full flex flex-col justify-evenly">
						<DrawerHeader className="cursor-grab active:cursor-grabbing">
							<DrawerTitle>Match Details</DrawerTitle>
							<DrawerDescription>
								Matched with{" "}
								<strong>{userData.matchedUser?.name || "Unknown"}</strong>
							</DrawerDescription>
						</DrawerHeader>

						<div className="p-4">
							<p>
								<b>Source:</b> {userData.userSourceName || "N/A"}
							</p>
							<p>
								<b>Destination:</b> {userData.userDestinationName || "N/A"}
							</p>
							<p>
								<b>Estimated Duration:</b> ~{" "}
								{Math.floor((userData.tripDuration || 0) / 60)} mins
							</p>

							<div className="flex flex-row justify-center space-x-5 mt-3">
								<Link to="/call" className="w-1/3 block">
									<Button
										variant="outline"
										className="bg-black text-white w-full"
									>
										Call
									</Button>
								</Link>
								<Link to={`/chat?${roomId}`} className="w-1/3 block">
									<Button
										variant="outline"
										className="bg-black text-white w-full"
									>
										Message
									</Button>
								</Link>
							</div>
						</div>

						<div className="p-4 flex justify-end">
							<Button variant="outline" onClick={() => setDrawerOpen(false)}>
								Close
							</Button>
						</div>
					</div>
				</DrawerContent>
			</Drawer>

			{/* Floating Button to Reopen Drawer */}
			{!drawerOpen && (
				<Button
					onClick={() => setDrawerOpen(true)}
					className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full shadow-lg"
				>
					Show Match Details
				</Button>
			)}

			{/* Back Button */}
			<Button className="fixed top-4 left-4 bg-black text-white px-4 py-2 rounded-full shadow-lg">
				<Link to="/matched-users">← Back</Link>
			</Button>
		</div>
	);
};

export default ViewMatch;
