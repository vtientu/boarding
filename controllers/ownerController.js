const Room = require("../models/Room");
const User = require("../models/User");
const BoardingHouse = require("../models/BoardingHouse");
const Bill = require("../models/Bill");
const Payment = require("../models/Payment");
const Contract = require("../models/Contract");
const { isValidObjectId } = require("mongoose");
const Role = require("../models/Role");

exports.manageRooms = async (req, res) => {
	try {
		const rooms = await Room.find({ landlord_id: req.user.id })
			.populate("tenant_id")
			.populate("boarding_house_id");

		const roomStats = {
			total: rooms.length,
			available: rooms.filter((room) => room.status === "Available").length,
			occupied: rooms.filter((room) => room.status === "Occupied").length,
		};

		res.json({ rooms, roomStats });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.manageTenants = async (req, res) => {
	try {
		const { action } = req.query;

		switch (action) {
			case "assignToRoom":
				return await assignTenantToRoom(req, res);
			case "removeFromRoom":
				return await removeTenantFromRoom(req, res);
			default:
				const tenants = await User.find({
					role_id: await Role.findOne({ role_name: "Tenant" })._id,
				}).select("-password");
				return res.json(tenants);
		}
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

async function assignTenantToRoom(req, res) {
	const { tenant_id, room_id } = req.body;

	// Verify tenant exists
	const tenant = await User.findById(tenant_id);
	if (!tenant) {
		return res.status(404).json({ message: "Tenant not found" });
	}

	// Update room with tenant
	const updatedRoom = await Room.findByIdAndUpdate(
		room_id,
		{
			tenant_id: tenant_id,
			status: "Occupied",
		},
		{ new: true }
	);

	res.json(updatedRoom);
}

async function removeTenantFromRoom(req, res) {
	const { room_id } = req.body;

	// Update room to available
	const updatedRoom = await Room.findByIdAndUpdate(
		room_id,
		{
			tenant_id: null,
			status: "Available",
		},
		{ new: true }
	);

	res.json(updatedRoom);
}

exports.createBill = async (req, res) => {
	try {
		const {
			room_id,
			user_id,
			room_price,
			electricity,
			water,
			additional_services,
			payment_deadline,
			details,
			image,
		} = req.body;

		const bill = new Bill({
			room_id,
			user_id,
			room_price,
			electricity,
			water,
			additional_services,
			payment_deadline: new Date(payment_deadline),
			details,
			image,
		});

		await bill.save();

		res.status(201).json({ message: "Bill created successfully", bill });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.updateBill = async (req, res) => {
	try {
		const { id } = req.params;
		if (!isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid bill ID" });
		}
		const {
			room_price,
			electricity,
			water,
			additional_services,
			payment_deadline,
			details,
			image,
		} = req.body;

		const bill = await Bill.findByIdAndUpdate(
			id,
			{
				room_price,
				electricity,
				water,
				additional_services,
				payment_deadline: new Date(payment_deadline),
				details,
				image,
			},
			{ new: true }
		);

		res.status(200).json({ message: "Bill updated successfully", bill });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.getBills = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;

		const skip = (page - 1) * limit;
		const bills = await Bill.find();

		const totalBills = await Bill.countDocuments({
			room_id: {
				$in: await Room.find({ landlord_id: req.user.id }).select("_id"),
			},
		});

		return res.status(200).json({
			data: bills,
			pagination: {
				total: totalBills,
				page: parseInt(page),
				limit: parseInt(limit),
				pages: Math.ceil(totalBills / limit),
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.generateReports = async (req, res) => {
	try {
		const boardingHouse = await BoardingHouse.findOne({
			landlord_id: req.user.id,
		});

		const totalIncome = await Payment.aggregate([
			{
				$match: {
					user_id: {
						$in: await User.find({
							role_id: await Role.findOne({ role_name: "Tenant" })._id,
						}).select("_id"),
					},
				},
			},
			{ $group: { _id: null, total: { $sum: "$total_amount" } } },
		]);

		const roomStats = await Room.aggregate([
			{ $match: { landlord_id: req.user.id } },
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		res.json({
			totalIncome: totalIncome[0]?.total || 0,
			roomStats,
			boardingHouse,
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
