const mongoose = require("mongoose");

const BoardingHouseSchema = new mongoose.Schema(
	{
		total_income: {
			type: Number,
			default: 0,
		},
		empty_rooms: {
			type: Number,
			default: 0,
		},
		occupied_rooms: {
			type: Number,
			default: 0,
		},
		status: {
			type: String,
			enum: ["Active", "Inactive"],
			default: "Active",
		},
		location: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("BoardingHouse", BoardingHouseSchema);
