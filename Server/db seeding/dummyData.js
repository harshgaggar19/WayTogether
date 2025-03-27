import mongoose from "mongoose";
import User from "../model/userModel.js";

const dummyUsers = [
	// Basic Case: Straightforward matching route
	//long,lat
	{
		name: "User A",
		ridePreferences: {
			from: {
				name: "Pune City Center",
				type: "Point",
				coordinates: [73.8567, 18.5204],
			},
			to: {
				name: "Pune Railway Station",
				type: "Point",
				coordinates: [73.8553, 18.5018],
			},
			date: new Date("2025-03-22T09:00:00Z"),
			time: "09:00",
			flexibilityInMinutes: 30,
		},
	},

	// Edge Case: Starting point very close to another user's destination
	{
		name: "User B",
		ridePreferences: {
			from: {
				name: "Pune Railway Station",
				type: "Point",
				coordinates: [73.8553, 18.5018],
			},
			to: {
				name: "Near Swargate",
				type: "Point",
				coordinates: [73.8478, 18.5015],
			},
			date: new Date("2025-03-22T09:15:00Z"),
			time: "09:15",
			flexibilityInMinutes: 15,
		},
	},

	// Edge Case: Overlapping start and end points (perfect match)
	{
		name: "User C",
		ridePreferences: {
			from: {
				name: "Pune City Center",
				type: "Point",
				coordinates: [73.8567, 18.5204],
			},
			to: {
				name: "Pune Railway Station",
				type: "Point",
				coordinates: [73.8553, 18.5018],
			},
			date: new Date("2025-03-22T09:30:00Z"),
			time: "09:30",
			flexibilityInMinutes: 20,
		},
	},

	// Edge Case: Slightly out-of-route points (potentially ignored by indexing)
	{
		name: "User D",
		ridePreferences: {
			from: {
				name: "Koregaon Park",
				type: "Point",
				coordinates: [73.8672, 18.5136],
			},
			to: {
				name: "Magarpatta City",
				type: "Point",
				coordinates: [73.9096, 18.5636],
			},
			date: new Date("2025-03-22T10:00:00Z"),
			time: "10:00",
			flexibilityInMinutes: 45,
		},
	},

	// Edge Case: Same start and end points, different times (time flexibility test)
	{
		name: "User E",
		ridePreferences: {
			from: {
				name: "Pune City Center",
				type: "Point",
				coordinates: [73.8567, 18.5204],
			},
			to: {
				name: "Dadawadi",
				type: "Point",
				coordinates: [73.8553, 18.5018],
			},
			date: new Date("2025-03-22T11:00:00Z"),
			time: "11:00",
			flexibilityInMinutes: 5, // Strict timing preference
		},
	},

	// Edge Case: Outlier point near Pune's outskirts (to test radius limits)
	{
		name: "User F",
		ridePreferences: {
			from: {
				name: "Katraj Area",
				type: "Point",
				coordinates: [73.7898, 18.4501],
			},
			to: {
				name: "Pune Railway Station",
				type: "Point",
				coordinates: [73.8553, 18.5018],
			},
			date: new Date("2025-03-22T08:00:00Z"),
			time: "08:00",
			flexibilityInMinutes: 30,
		},
	},
];

// Insert the dummy users into MongoDB
async function seedDatabase() {
	try {
		await mongoose.connect(
			"mongodb+srv://harshgaggar455:4xsqMX7RS.wQh8_@cluster0.fwnsn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
		); // Update with your MongoDB details
		await User.deleteMany({});
		// await User.insertMany(dummyUsers);
		console.log("deleted successfully");
	} catch (error) {
		console.error("Error inserting dummy users:", error);
	} finally {
		await mongoose.disconnect();
	}
}

seedDatabase();
