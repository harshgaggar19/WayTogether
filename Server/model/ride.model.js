const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  currentLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  source: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
  },
  destination: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
  },
  waypoints: [
    {
      latitude: Number,
      longitude: Number,
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
  matchedPassenger: {
    userId: { type: String },
    name: { type: String },
    status: { type: String, enum: ["pending", "confirmed", "completed"], default: "pending" },
  },
});

const Passenger = mongoose.model("Passenger", passengerSchema);
module.exports = Passenger;
