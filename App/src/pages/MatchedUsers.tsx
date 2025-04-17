import LoadingSpinner from "@/components/LoadingSpinner";
import  { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useWebSocket } from "./Websocket";
import { toast } from "sonner";
import { IoNotificationsOutline, IoNotifications } from "react-icons/io5";
// import { match } from "assert";
// import { FaMapMarkerAlt } from "react-icons/fa";

const MatchedUsersPage = () => {
	const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
	// const [updateTrigger, setUpdateTrigger] = useState(0);
	// const wsRef = useRef<WebSocket | null>(null);
	const [loading, setLoading] = useState(true);
	const { user } = useUser();
	const [userId, setUserId] = useState();
	console.log(user?.id);
	//const [notifications, setNotifications] = useState<{ message: string; sender: string }[]>([]); un
	// const [socket,setSocket]=useState();
	const { notifications, connectWebSocket } = useWebSocket();
	const [showDropdown, setShowDropdown] = useState(false);
	const [refresh, setRefresh] = useState(false);
	
	const backend_url = import.meta.env.VITE_BACKEND_URL;
	// const [PreviousMessages, setPreviousMessages] = useState<string[]>([]);

	const handleRefresh = async () => {
		const matchMessage = localStorage.getItem("matchMessage");
		
		if (!matchMessage) {
			return;	
		};
		try {
			let message = JSON.parse(matchMessage || "{}");
			console.log("refreshing")
			const response = await axios.post(
				`${backend_url}/users/find-match`,
				{
					from: message.from,
					to: message.to,
					fromName: message.fromName,
					toName: message.toName,
					clerkUserId: message.clerkUserId,
				},
				{
					headers: { "Content-Type": "application/json" },
				}
			);

			if (response.status === 200) {
				setRefresh(!refresh);
				toast.success(" Matches refreshed!");
			} 
		} catch (error) {
			console.error("Error refreshing matches:", error);
			toast.error("Failed to refresh matches");
		}
	};

	useEffect(() => {
		if (!user?.id) return;
		console.log("Fetching matches");

		setLoading(true);
		fetch(`${backend_url}/users/get-match?clerkUserId=${user?.id}`)
			.then((res) => res.json())
			.then((data) => {
				console.log("Matched users data:", data);
				if (data.matches && data.matches.matchedUserDetails) {
					setMatchedUsers(data.matches.matchedUserDetails || []);
				} else {
					setMatchedUsers([]);
				}
			})
			.catch((error) => console.error("Error fetching matched users:", error))
			.finally(() => setLoading(false));
	}, [user?.id, refresh]);

	useEffect(() => {
		fetch(`${backend_url}/users/get-current-user?clerkUserId=${user?.id}`)
			.then((res) => res.json())
			.then((data) => {
				console.log("Fetched user data:", data);
				if (data.user) {
					console.log("CurrentID", data.user._id);

					setUserId(data.user._id);
				}
			})
			.catch((error) => {
				console.error("Error fetching user data:", error);
			});
	}, [user?.id]);
	useEffect(() => {
		if (userId) connectWebSocket(userId);
		// toast.success("Notification received");
	}, [userId]);
	useEffect(() => {
		// const sender = notifications[0];
		// console.log("sender",sender);
		if (notifications.length != 0)
			toast.success(
				`Notification received from ${
					notifications[notifications.length - 1].sender
				}`
			);
	}, [notifications]);
	// useEffect(()=>{
	// 	if (!userId) return;
	// 	if (!wsRef.current) {
	// 		wsRef.current = new WebSocket("ws://localhost:8081");
	// 	}
	// 	console.log("USerId",userId);

	// 		wsRef.current.onopen = () => {
	// 			console.log("WebSocket connected");
	// 			wsRef.current?.send(JSON.stringify({ type: "connect", userId:userId }));
	// 		};

	// 		wsRef.current.onmessage = (event) => {
	// 			const data = JSON.parse(event.data);
	// 			console.log("Received message:", data);

	// 			if (data.type === "Notification") {
	// 				setNotifications((prev) => [...prev, { message: data.message, sender: data.sender }]);
	// 			}
	// 		};

	// 		wsRef.current.onclose = () => {
	// 			console.log("WebSocket disconnected. Reconnecting...");
	// 			setTimeout(() => {
	// 				wsRef.current = new WebSocket("ws://localhost:8081");
	// 			}, 2000);
	// 		};
	// },[userId])

	return (
		<div className="p-4 max-w-md mx-auto relative">
			<div className="flex justify-between items-center mb-4">
				<Link to="/home">
					<button className="text-gray-600 flex items-center">← Back</button>
				</Link>

				{/* Notification Icon */}
				<div className="relative right-20 top-4 mb-5 space-x-3 flex">
					<button
						onClick={() => setShowDropdown(!showDropdown)}
						className="text-gray-600 text-2xl"
					>
						{notifications.length > 0 ? (
							<IoNotifications />
						) : (
							<IoNotificationsOutline />
						)}
					</button>

					<button
						className="text-gray-600 top-2 relative mb-4"
						onClick={handleRefresh}
					>
						Refresh
					</button>

					{/* Dropdown for Notifications */}
					{showDropdown && (
						<div className="absolute right-0 top-8 mt-2 w-64 bg-white shadow-lg rounded-lg p-2">
							<h4 className="font-bold text-gray-800">Notifications</h4>
							{notifications.length > 0 ? (
								notifications.map((notif, index) => (
									<div key={index} className="border-b p-2">
										<p className="font-semibold">From: {notif.sender}</p>
										<p>{notif.message}</p>
									</div>
								))
							) : (
								<p className="text-gray-500 p-2">No new messages</p>
							)}
						</div>
					)}
				</div>
			</div>

			<h2 className="text-xl font-bold text-gray-800">
				Available passengers for ride
			</h2>
			{matchedUsers.length > 0 && (
				<p className="text-gray-500 mb-4">
					{matchedUsers.length} matches found
				</p>
			)}

			{loading ? (
				<LoadingSpinner />
			) : matchedUsers.length > 0 ? (
				matchedUsers.map((match: any, index: number) => (
					<div
						key={index}
						className="border border-gray-500 text-black bg-gray-100 rounded-lg p-4 mb-4 shadow-xl hover:shadow-2xl"
					>
						<h3 className="font-bold text-gray-800 text-2xl underline-offset-4">
							{match.matchedUser?.name || "Unknown User"}
						</h3>
						<p>
							<b>Source:</b> {match.userSourceName}
						</p>
						<p>
							<b>Destination:</b> {match.userDestinationName}
						</p>
						<p>
							<b>Trip Duration:</b> ~{Math.floor(match.tripDuration / 60)}{" "}
							minutes
						</p>
						<p>
							<b>Trip Cost:</b> ~{Math.floor(match.tripCost)} - { Math.floor(match.tripCost + (0.3*match.tripCost))}{" "}
							/-
						</p>
						<Link to={`/view-match/${match.matchedUser?._id}`}>
							<button className="mt-3 w-full border border-gray-500 bg-black text-white py-2 rounded-md">
								View
							</button>
						</Link>
					</div>
				))
			) : (
				<p className="flex justify-center items-center p-4 mt-4 h-[10vh] border rounded-3xl font-semibold hover:shadow-2xl">No Matches Found... Try again later.</p>
			)}
		</div>
	);
};

export default MatchedUsersPage;
