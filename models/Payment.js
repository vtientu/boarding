const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
	{
		bill_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Bill",
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		contract_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Contract",
			required: true,
		},
		payment_date: {
			type: Date,
			default: Date.now,
		},
		payment_method: {
			type: String,
			enum: ["Cash", "Bank Transfer", "Credit Card", "Online Payment"],
			required: true,
		},
		total_amount: {
			type: Number,
			required: true,
		},
		payment_status: {
			type: String,
			enum: ["Pending", "Completed", "Failed"],
			default: "Pending",
		},
		transaction_code: {
			type: String,
			unique: true,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Payment", PaymentSchema);
