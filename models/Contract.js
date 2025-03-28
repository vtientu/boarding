const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		room_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Room",
			required: true,
		},
		start_date: {
			type: Date,
			required: true,
		},
		end_date: {
			type: Date,
			required: true,
		},
		rental_price: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: ["Active", "Expired", "Terminated"],
			default: "Active",
		},
		description: {
			type: String,
		},
		rental_period: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Contract", ContractSchema);
