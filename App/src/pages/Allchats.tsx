import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
interface Group {
	roomId: string;
	name: string;
}

export default function JoinedGroups() {
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const phone = useParams(); // Replace with actual user phone from state/context

	const backend_url = import.meta.env.VITE_BACKEND_URL;

	useEffect(() => {
		fetch(`${backend_url}/api/rooms`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ phone }),
		})
			.then((res) => res.json())
			.then((data) => {
				setGroups(data.rooms);
				console.log(data.rooms);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Error fetching groups:", err);
				setError("Failed to load groups.");
				setLoading(false);
			});
	}, []);

	return (
		<div className="min-h-screen bg-white text-black flex flex-col items-center p-4">
			<div className="flex items-center space-x-4 my-4">
				<button
					className="px-4 py-2 bg-black text-white rounded-lg"
					onClick={() => window.history.back()}
				>
					←
				</button>
				<h1 className="text-3xl font-bold">Joined Groups</h1>
			</div>

			{loading && <p className="text-gray-600">No groups joined yet.</p>}
			{error && <p className="text-red-600">{error}</p>}

			<div className="w-full max-w-md">
				{groups.length === 0 && !loading && <p>No groups joined yet.</p>}

				<ul className="space-y-3">
					{groups.map((group: Group) => (
						<li
							key={group.roomId}
							className="p-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-400 transition-all"
							// onClick={() => alert(`Opening group: ${group.name}`)}
						>
							<Link to={`/chat/${group.roomId}`} className="w-2/3 block">
								<h2 className="text-lg font-semibold">
									<div className="flex items-center space-x-4">
										<Avatar>
											<AvatarFallback className="bg-black text-white text-sm ">
												{group.name
													.split(" ")
													.map((word) => word[0])
													.join("")
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<span className=" text-gray-800 mx-1">{group.name}</span>
									</div>
								</h2>
							</Link>
							{/* <p className="text-gray-700 text-sm">Room ID: {group.roomId}</p> */}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
