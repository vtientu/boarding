const User = require("../models/User");
const Contract = require("../models/Contract");
const Bill = require("../models/Bill");
const Payment = require("../models/Payment");

exports.updateTenantProfile = async (req, res) => {
	try {
		const { name, phone, address, age, gender } = req.body;

		const updatedUser = await User.findByIdAndUpdate(
			req.user.id,
			{ name, phone, address, age, gender },
			{ new: true, runValidators: true },
		).select("-password");

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(updatedUser);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.getTenantProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id)
			.select("-password")
			.populate("role_id");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.getTenantContracts = async (req, res) => {
	try {
		const contracts = await Contract.find({ user_id: req.user.id })
			.populate("room_id")
			.sort({ createdAt: -1 });

		res.json(contracts);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.getTenantPaymentHistory = async (req, res) => {
	try {
		const payments = await Payment.find({ user_id: req.user.id })
			.populate("bill_id")
			.populate("contract_id")
			.sort({ payment_date: -1 });

		res.json(payments);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.getTenantBills = async (req, res) => {
	try {
		const bills = await Bill.find({ tenant_id: req.user.id })
			.select("-__v")
			.populate("room_id", "_id room_number room_type")
			.populate("tenant_id", "_id name phone address")
			.sort({ createdAt: -1 });

		res.status(200).json({ data: bills });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


