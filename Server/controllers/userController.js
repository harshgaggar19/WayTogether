import User from "../model/userModel.js";
import {
	findMostOptimalRoute,
	findUserWithinRadius,
	getRoutePoints,
	haversine,
} from "../utils/userUtils.js";

import ActiveMatch from "../model/activeMatchModel.js";

export const createUser = async (req, res) => {
	try {
		const { firstName, lastName, email, password, phone, clerkUserId } = req.body;
		console.log(
			"body:",
			firstName,
			lastName,
			email,
			password,
			phone,
			clerkUserId
		);
		console.log("inside create user");

		if (!firstName || !lastName || !email || !password || !phone|| !clerkUserId) {
			console.log("all feilds required");
			return res.status(400).json({ error: "All fields are required." });
		}
		// Check if user already exists based on Clerk IDz
		let users = await User.find({});
		console.log("users", users);
		let existingUser = await User.findOne({ clerkUserId });
		if (existingUser) {
			return res.status(409).json({ error: "User already exists." });
		}

		// Create new user
		const newUser = new User({
			name: `${firstName} ${lastName}`,
			email,
			password,
			phone,
			clerkUserId,
		});

		const response = await newUser.save();
		console.log("response:",response);
		res
			.status(201)
			.json({ message: "User created successfully", user: newUser });
	} catch (error) {
		console.error("Error creating user:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const findMatch = async (req, res) => {
	console.log(req.body);
	const { from, to, fromName, toName, clerkUserId } = req.body; //lat, lng
	console.log("clerk id:", clerkUserId);

	if (!clerkUserId) {
		return res.status(400).json({ error: "Clerk User ID is required" });
	}
	// console.log("User's Source:", from);
	// console.log("User's Destination:", to);
	const result = [];
	try {
		const query = await fetch(
			`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson&access_token=pk.eyJ1IjoibWR0b3VzaWYwMDciLCJhIjoiY2x4dHplOGh4MWw3eTJqcXl4dWM5eHU2NiJ9.69lnpa9uRrPPxXUfhOPeyg`
		);

		const data = await query.json();
		// console.log(data);
		if (!data.routes || data.routes.length === 0) {
			return res.status(400).json({ message: "No routes found" });
		}

		console.log("Route fetched successfully.");
		const route = data.routes[0].geometry;

		let matchedUsers = new Map();

		const latitudes = route.coordinates.map((c) => c[1]);
		const longitudes = route.coordinates.map((c) => c[0]);
		const user = await User.findOne({ clerkUserId: clerkUserId });
		if (!user) {
			console.log("user not found");
			return res.status(404).json({ message: "User not found" });
		}

		const users = await ActiveMatch.find({ isLookingForRide: true,user:{$ne: [user._id]} }).populate(
			"user"
		);
		console.log("users: ------",users);
		console.log(`Total users in DB: ${users.length}`);

		const userLocations = users.reduce((acc, user) => {
			acc[user.user.name] = {
				id: user.user._id,
				name: user.user.name,
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

		// console.log(userLocations);

		const radius = 1;

		for (let i = 0; i < latitudes.length; i++) {
			const userMatchArr = findUserWithinRadius(
				userLocations,
				latitudes[i],
				longitudes[i],
				radius
			);
			if (userMatchArr != null) {
				for (let z = 0; z < userMatchArr.length; z++) {
					const userMatch = userMatchArr[z];
					if (userMatch && !matchedUsers.has(userMatch)) {
						console.log(`Potential match found: ${userMatch}`);

						let destinationFound = false;
						for (let j = i; j < latitudes.length; j++) {
							const d = haversine(
								latitudes[j],
								longitudes[j],
								userLocations[userMatch].destination.latitude,
								userLocations[userMatch].destination.longitude
							);
							if (d <= radius) {
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
							// console.log(routeB);
							const latitudesB = routeB.coordinates.map((c) => c[1]);
							const longitudesB = routeB.coordinates.map((c) => c[0]);
							//find user destination in user_b ka path
							for (let i = 0; i < latitudesB.length; i++) {
								const d = haversine(
									latitudesB[i],
									longitudesB[i],
									to.lat,
									to.lng
								);
								if (d <= 1) {
									// let b_found = true;

									console.log(`in b route found.`);
									matchedUsers.set(userMatch, userLocations[userMatch]);
								} else {
									console.log("not found in b route");
								}
							}
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
				matchedUser: matchedUsersArray[i].id,
				source: output.sequence[0],
				stop1: output.sequence[1],
				stop2: output.sequence[2],
				destination: output.sequence[3],
				userSourceName: matchedUsersArray[i].source.name,
				userDestinationName: matchedUsersArray[i].destination.name,
				tripDuration: output.duration, // store duration in minutes or seconds]
				tripCost: output.cost
			});
		}

		
let activeMatch = await ActiveMatch.findOne({ user: user._id });

if (activeMatch) {
	activeMatch.matchedUsers = result.map((r) => r.matchedUser);
	activeMatch.matchedUserDetails = result;
	activeMatch.ridePreferences = {
		from: {
			name: fromName,
			type: "Point",
			coordinates: [from.lng, from.lat],
		},
		to: {
			name: toName,
			type: "Point",
			coordinates: [to.lng, to.lat],
		},
		date: new Date(),
		time: new Date().toLocaleTimeString(),
	};

	await activeMatch.save();
	console.log("Updated existing ActiveMatch");
} else {
	activeMatch = new ActiveMatch({
		user: user._id,
		matchedUsers: result.map((r) => r.matchedUser),
		matchedUserDetails: result,
		ridePreferences: {
			from: {
				name: fromName,
				type: "Point",
				coordinates: [from.lng, from.lat],
			},
			to: {
				name: toName,
				type: "Point",
				coordinates: [to.lng, to.lat],
			},
			date: new Date(),
			time: new Date().toLocaleTimeString(),
		},
	});

	await activeMatch.save();
	console.log("Created new ActiveMatch");
}

		console.log("result:", result);
		// console.log("response",response);


		res.status(200).json({ message: "Matched users saved successfully." });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMatchedUsers = async (req, res) => {
	try {
		const clerkUserId = req.query.clerkUserId;
		console.log("clerkUserId:", clerkUserId);

		const user = await User.findOne({ clerkUserId: clerkUserId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const activeMatch = await ActiveMatch.findOne({ user: user._id })
			.populate("matchedUsers", "name email phone clerkUserId") // Populate basic user details
			.populate(
				"matchedUserDetails.matchedUser",
				"name email phone clerkUserId"
			); // Populate users inside matchedUserDetails

		// console.log(activeMatch);

		if (!activeMatch) {
			return res.status(404).json({ message: "No matched users found." });
		}
		console.log("activeMatch----------", activeMatch);
		res.status(200).json({ matches: activeMatch });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFinalMatch = async (req, res) => {
	try {
		const { clerkUserId, matchedUserId } = req.query;

		console.log("clerkUserId:", clerkUserId);
		console.log("matchedUserId:", matchedUserId);

		const user = await User.findOne({ clerkUserId: clerkUserId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const activeMatch = await ActiveMatch.findOne({ user: user._id }).populate({
			path: "matchedUserDetails.matchedUser",
			select: "name email phone clerkUserId",
		});

		// Ensure matchedUserDetails exists and is an array
		if (!activeMatch || !Array.isArray(activeMatch.matchedUserDetails)) {
			return res.status(404).json({ message: "No matched users found." });
		}

		// Find the match
		const matchedUser = activeMatch.matchedUserDetails.find(
			(m) => m.matchedUser && m.matchedUser._id.toString() === matchedUserId
		);

		if (!matchedUser) {
			return res.status(404).json({ message: "Matched user not found." });
		}

		res.status(200).json({ match: matchedUser });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const points = (req, res) => {
	res
		.status(200)
		.json({ puneStation: [73.8553, 18.5018], swargate: [73.8478, 18.5015] });
};

export const getCurrUser = async (req, res) => {
	const { clerkUserId } = req.query;
	console.log("clerkUserId:", clerkUserId);
	if (!clerkUserId) {
		return res.status(400).json({ error: "Clerk User ID is required" });
	}
	try {
		const user = await User.findOne({ clerkUserId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json({ user });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}