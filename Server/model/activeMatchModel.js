import mongoose from "mongoose";

const activeMatchSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	ridePreferences: {
		from: {
			name: { type: String, required: true }, // Added source name
			type: { type: String, default: "Point" },
			coordinates: { type: [Number], required: true }, // [longitude, latitude]
		},
		to: {
			name: { type: String, required: true }, // Added destination name
			type: { type: String, default: "Point" },
			coordinates: { type: [Number], required: true },
		},
		date: { type: Date, required: true, default: Date.now },
		time: { type: String, required: true, default: Date.now }, // Can be HH:mm format
		flexibilityInMinutes: { type: Number, default: 30 }, // How much time shift is acceptable
	},
	matchedUsers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	matchedUserDetails: [
		{
			matchedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
			source: { type: [Number], required: true }, // Expecting an array of numbers
			stop1: { type: [Number], required: true },
			stop2: { type: [Number], required: true },
			destination: { type: [Number], required: true },
			userSourceName: String,
			userDestinationName: String,
			tripDuration: Number, // in minutes or seconds
			tripCost:Number,
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	isLookingForRide: { type: Boolean, default: true },
	expiresAt: {
		type: Date,
		default: function () {
			return new Date(Date.now() + 30 * 60 * 1000); // Auto delete after 30 min
		},
		index: { expires: "30m" }, // TTL index for automatic deletion
	},
});

const ActiveMatch = mongoose.model("ActiveMatch", activeMatchSchema);

export default ActiveMatch;