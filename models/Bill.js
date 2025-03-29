const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema(
	{
		room_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Room",
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		room_price: {
			type: Number,
			required: true,
		},
		electricity: {
			type: Number,
			default: 0,
		},
		water: {
			type: Number,
			default: 0,
		},
		additional_services: {
			type: Number,
			default: 0,
		},
		payment_deadline: {
			type: Date,
			required: true,
		},
		details: {
			type: Object,
		},
		image: {
			type: String,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Bill", BillSchema);
