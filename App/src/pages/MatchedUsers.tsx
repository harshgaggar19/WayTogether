import LoadingSpinner from "@/components/LoadingSpinner";
import { match } from "assert";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
// import { FaMapMarkerAlt } from "react-icons/fa";

const MatchedUsersPage = () => {
	const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const { user } = useUser();

	useEffect(() => {
		if (!user?.id) return;
		console.log("hello")

		setLoading(true);
		fetch(`http://localhost:8080/users/get-match?clerkUserId=${user?.id}`)
			.then((res) => res.json())
			.then((data) => {
				console.log("Matched users data:", data);
				if (data.matches && data.matches.matchedUserDetails) {
					// Extract the first (and only) activeMatch
					
					setMatchedUsers(data.matches.matchedUserDetails || []);
					console.log("matchedUsers", data.matches.matchedUserDetails);
				} else {
					setMatchedUsers([]);
				}
			})
			.catch((error) => {
				console.error("Error fetching matched users:", error);
			})
			.finally(() => setLoading(false));
	}, [user?.id]);

	return (
		<div className="p-4 max-w-md mx-auto">
			<Link to="/home">
				<button className="text-gray-600 flex items-center mb-4">← Back</button>
			</Link>

			<h2 className="text-xl font-bold text-gray-800">
				Available passengers for ride
			</h2>

			{matchedUsers.length > 0 ? (
				<p className="text-gray-500 mb-4">
					{matchedUsers.length} matches found
				</p>
			) : null}

			{loading ? (
				<LoadingSpinner />
			) : matchedUsers.length > 0 ? (
				matchedUsers.map((match: any, index: number) => (
					<div
						key={index}
						className="border border-gray-500 text-black bg-gray-100 rounded-lg p-4 mb-4"
					>
						<h3 className="font-bold text-gray-800 text-lg underline underline-offset-4">
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
						<Link to={`/view-match/${match.matchedUser?._id}`}>
							<button className="mt-3 w-full border border-gray-500 bg-black text-white py-2 rounded-md">
								View
							</button>
						</Link>
					</div>
				))
			) : (
				<p>No Matches Found... Try again later.</p>
			)}
		</div>
	);
};

export default MatchedUsersPage;
