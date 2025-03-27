import LoadingSpinner from "@/components/LoadingSpinner";
import { match } from "assert";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { FaMapMarkerAlt } from "react-icons/fa";

const MatchedUsersPage = () => {
	const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("http://localhost:8080/users/get-match")
			.then((res) => res.json())
			.then((data) => {
				setMatchedUsers(data.matches || []);
			})
			.catch((error) => {
				console.error("Error fetching matched users:", error);
			})
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="p-4 max-w-md mx-auto">
			<Link to="/home">
				<button className="text-gray-600 flex items-center mb-4">← Back</button>
			</Link>

			<h2 className="text-xl font-bold text-gray-800">
				Available passengers for ride
      </h2>
      
      {matchedUsers.length > 0 ? <p className="text-gray-500 mb-4">
							{matchedUsers.length} matches found
						</p> : null}

			{loading ? (
				<LoadingSpinner />
			) : matchedUsers.length > 0 ? (
				matchedUsers.map((user: any, index: number) => (
				
						
						<div
							key={index}
							className="border border-gray-500 text-black bg-gray-100 rounded-lg p-4 mb-4"
						>
							<h3 className="font-bold text-gray-800 text-lg underline underline-offset-4">
								{user.matchedUser}
							</h3>
							<p className="">
								{" "}
								<b> Source:</b> {user.userSourceName}
							</p>
							<p className="">
								<b> Destination:</b> {user.userDestinationName}
							</p>
							<p className="">
								<b>Trip Duration: </b>
								~{Math.floor(user.tripDuration/60)} minutes
            </p>
            <Link to={`/view-match/${user.matchedUser}`}>
            <button className="mt-3 w-full border border-gray-500 bg-black text-white py-2 rounded-md">
								View
							</button></Link>
							
						</div>
			
				))
			) : (
				<p>No Matches Found... Try again later.</p>
			)}
		</div>
	);
};

export default MatchedUsersPage;
