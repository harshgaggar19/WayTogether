import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	phone:{type:String},
	rooms: [{ type: String }],
	// User's preferred route for ride-matching
	// ridePreferences: {
	// 	from: {
	// 		type: { type: String, default: "Point" },
	// 		coordinates: { type: [Number], required: true }, // [longitude, latitude]
	// 	},
	// 	to: {
	// 		type: { type: String, default: "Point" },
	// 		coordinates: { type: [Number], required: true },
	// 	},
	// 	date: { type: Date, required: true },
	// 	time: { type: String, required: true }, // Can be HH:mm format
	// 	flexibilityInMinutes: { type: Number, default: 30 }, // How much time shift is acceptable
	// },

	// // Ride status
	// isLookingForRide: { type: Boolean, default: true },
	// matchedRide: { type: mongoose.Schema.Types.ObjectId, ref: "Ride" },

	// createdAt: { type: Date, default: Date.now },
	// clerkid: {
	// 	type: String,
	// 	required: true,
	// },
});

// Create geospatial indexes for optimized location-based queries
UserSchema.index({ "ridePreferences.from": "2dsphere" });
UserSchema.index({ "ridePreferences.to": "2dsphere" });

const User = mongoose.model("User", UserSchema);
export default User;
