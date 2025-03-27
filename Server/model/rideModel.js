import mongoose from "mongoose";

const RideSchema = new mongoose.Schema({
	passengers: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
			status: {
				type: String,
				enum: ["pending", "confirmed", "cancelled"],
				default: "pending",
			},
		},
	],

	//ride source
	from: {
		type: { type: String, default: "Point" },
		coordinates: { type: [Number], required: true },
	},
	//ride 1st stop
	stop1: {
		type: { type: String, default: "Point" },
		coordinates: { type: [Number], required: true },
	},
	//ride 2nd stop
	stop2: {
		type: { type: String, default: "Point" },
		coordinates: { type: [Number], required: true },
	},
	//ride destination
	to: {
		type: { type: String, default: "Point" },
		coordinates: { type: [Number], required: true },
	},

	date: { type: Date, required: true },
	time: { type: String, required: true },

	status: {
		type: String,
		enum: ["scheduled", "in-progress", "completed", "cancelled"],
		default: "scheduled",
	},

	estimatedCost: { type: Number }, // Total cost of the ride
	estimatedDuration: { type: Number }, // In minutes
	costUser1: {
		type: Number,
	},
	costUser2: {
		type: Number,
	},

	createdAt: { type: Date, default: Date.now },
});

// Geospatial Index for Searching Rides
// RideSchema.index({ from: "2dsphere" });
// RideSchema.index({ to: "2dsphere" });

module.exports = mongoose.model("Ride", RideSchema);
