import User from "../model/userModel.js";
import { findMostOptimalRoute, findUserWithinRadius, getRoutePoints, haversine } from "../utils/userUtils.js";
import redisClient from "../redisClient.js";

export const signup = async (req, res) => {
	const { name, email, id } = req.body;
	try {
		const user = await User.create({ name, email, clerkid: id });
		return res.status(201).json({
			success: true,
			data: user,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
// export const login = async (req, res) => {
// 	try {
// 		const clerkid = req.query.clerkid;
// 		if (!clerkid) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Email required",
// 			});
// 		}
// 		const response = await User.findOne({ clerkid });
// 		if (response) {
// 			return res.status(200).json({
// 				success: true,

// 			});
// 		} else {
// 			return res.status(404).json({
// 				success: false,
// 				message: "No data found",
// 			});
// 		}
// 	} catch (error) {
// 		console.log(error);
// 		return res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 		});
// 	}
// };

export const findMatch = async (req, res) => {
	const { from, to } = req.body; //lat, lng
	console.log("User's Source:", from);
	console.log("User's Destination:", to);
	const result = [];
	try {
		const query = await fetch(
			`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
		);

		const data = await query.json();
		if (!data.routes || data.routes.length === 0) {
			return res.status(400).json({ message: "No routes found" });
		}

		console.log("Route fetched successfully.");
		const route = data.routes[0].geometry;

		let matchedUsers = new Map();

		const latitudes = route.coordinates.map((c) => c[1]);
		const longitudes = route.coordinates.map((c) => c[0]);

		const users = await User.find({});
		console.log(`Total users in DB: ${users.length}`);

		const userLocations = users.reduce((acc, user) => {
			acc[user.name] = {
				name: user.name,
				source: {
					longitude: user.ridePreferences.from.coordinates[0],
					latitude: user.ridePreferences.from.coordinates[1],
					name: user.ridePreferences.from.name,
				},
				destination: {
					longitude: user.ridePreferences.to.coordinates[0],
					latitude: user.ridePreferences.to.coordinates[1],
					name: user.ridePreferences.to.name,
				},
			};
			return acc;
		}, {});

		const radius = 1;

		for (let i = 0; i < latitudes.length; i++) {
			const userMatch = findUserWithinRadius(
				userLocations,
				latitudes[i],
				longitudes[i],
				radius
			);

			if (userMatch && !matchedUsers.has(userMatch)) {
				console.log(`Potential match found: ${userMatch}`);

				let destinationFound = false;
				for (let j = i; j < latitudes.length; j++) {
					if (
						haversine(
							latitudes[j],
							longitudes[j],
							userLocations[userMatch].destination.latitude,
							userLocations[userMatch].destination.longitude,
						) <= radius
					) {
						console.log(`User ${userMatch} is a complete match.`);
						destinationFound = true;
						break;
					}
				}

				if (destinationFound) {
					matchedUsers.set(userMatch, userLocations[userMatch]);
				} else {
					console.log(`in a route not found`);
					let routeB = await getRoutePoints(
						[
							userLocations[userMatch].source.longitude,
							userLocations[userMatch].source.latitude,
						],
						[
							userLocations[userMatch].destination.longitude,
							userLocations[userMatch].destination.latitude,
						]
					);
					console.log(routeB);
					const latitudesB = routeB.coordinates.map((c) => c[1]);
					const longitudesB = routeB.coordinates.map((c) => c[0]);
					//find user destination in user_b ka path
					for (let i = 0; i < latitudesB.length; i++) {
						const d = haversine(
							latitudesB[i],
							longitudesB[i],
							to.lat,
							to.lng,
						);
						if (d <= 1) {
							b_found = true;
							
							console.log(`in b route found.`);
							matchedUsers.set(userMatch, userLocations[userMatch]);

						} else {
							console.log("not found in b route")
						}
					}
				}
			}
		}

		console.log("matchedUsers: ", matchedUsers);

		const matchedUsersArray = Array.from(matchedUsers.values());
		console.log(matchedUsersArray);
		for (let i = 0; i < matchedUsersArray.length; i++) {
			
			const output = await findMostOptimalRoute(
				[
					[from.lng, from.lat],
					[
						matchedUsersArray[i].source.longitude,
						matchedUsersArray[i].source.latitude,
					],
				],
				[
					[to.lng, to.lat],
					[
						matchedUsersArray[i].destination.longitude,
						matchedUsersArray[i].destination.latitude,
					],
				]
			);
			result.push({
				matchedUser: matchedUsersArray[i].name,
				source: output.sequence[0],
				stop1: output.sequence[1],
				stop2: output.sequence[2],
				destination: output.sequence[3],
				userSourceName: matchedUsersArray[i].source.name,
				userDestinationName: matchedUsersArray[i].destination.name,
				tripDuration: output.duration,
			});
		}

		console.log(result);

		if (result.length > 0) {
			await redisClient.setEx("matchedUsers",24* 60 * 60, JSON.stringify(result));
			console.log(`Stored ${result.length} matched users in Redis.`);
		} else {
			console.log("No matches found.");
			await redisClient.setEx(
				"matchedUsers",
				24 * 60 * 60,
				JSON.stringify(result)
			);
			return res.status(200).json({ message: "No matching users found." });
		}
		res.status(200).json({ message: "Matched users saved in Redis." });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};


export const getMatchedUsers = async (req, res) => { 
	try {
		const matchData = await redisClient.get("matchedUsers");

		if (!matchData) {
			return res.status(404).json({ message: "No matched users found." });
		}
		res.status(200).json({ matches: JSON.parse(matchData) });
	}catch (error) {
		console.error("Error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

export const points = (req, res) => { 
	res
		.status(200)
		.json({ puneStation: [73.8553, 18.5018], swargate: [73.8478, 18.5015] });
}