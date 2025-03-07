import mongoose from "mongoose";
const Schema = mongoose.Schema;

const rideSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	source: {
		type: {
			type: String,
			enum: ["Point"],
			required: true,
		},
		coordinates: {
			type: [Number],
			required: true,
		},
	},
	destination: {
		type: {
			type: String,
			enum: ["Point"],
			required: true,
		},
		coordinates: {
			type: [Number],
			required: true,
		},
	},
	status: {
		type: String,
	},
	travelTime: {
		type: Date,
		default: Date.now(),
	},
});




const Ride = mongoose.model('Ride', rideSchema);
export default Ride;