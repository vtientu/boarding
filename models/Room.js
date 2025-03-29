const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
	{
		room_number: {
			type: String,
			required: true,
		},
		room_type: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["Available", "Occupied", "Maintenance"],
			default: "Available",
		},
		capacity: {
			type: Number,
			required: true,
		},
		month_rent: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
		},
		address: {
			type: String,
		},
		tenant_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		landlord_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		boarding_house_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "BoardingHouse",
			required: true,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Room", RoomSchema);
