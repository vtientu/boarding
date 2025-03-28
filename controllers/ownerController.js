const Room = require("../models/Room");
const User = require("../models/User");
const BoardingHouse = require("../models/BoardingHouse");
const Bill = require("../models/Bill");
const Contract = require("../models/Contract");

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
			case "add":
				return await addTenant(req, res);
			case "update":
				return await updateTenant(req, res);
			case "delete":
				return await deleteTenant(req, res);
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

async function addTenant(req, res) {
	const { name, phone, address, age, gender, room_id } = req.body;

	const newTenant = new User({
		name,
		phone,
		address,
		age,
		gender,
		role_id: await Role.findOne({ role_name: "Tenant" })._id,
	});

	await newTenant.save();

	// Optionally assign to a room
	if (room_id) {
		await Room.findByIdAndUpdate(room_id, {
			tenant_id: newTenant._id,
			status: "Occupied",
		});
	}

	res.status(201).json(newTenant);
}

async function updateTenant(req, res) {
	const { id } = req.params;
	const { name, phone, address, age, gender, room_id } = req.body;

	const updatedTenant = await User.findByIdAndUpdate(
		id,
		{ name, phone, address, age, gender },
		{ new: true },
	);

	// Update room assignment if needed
	if (room_id) {
		await Room.findByIdAndUpdate(room_id, {
			tenant_id: updatedTenant._id,
			status: "Occupied",
		});
	}

	res.json(updatedTenant);
}

async function deleteTenant(req, res) {
	const { id } = req.params;

	// Remove tenant from room
	await Room.updateMany(
		{ tenant_id: id },
		{
			tenant_id: null,
			status: "Available",
		},
	);

	// Delete tenant
	await User.findByIdAndDelete(id);

	res.json({ message: "Tenant deleted successfully" });
}

exports.manageBills = async (req, res) => {
	try {
		const { action } = req.query;

		switch (action) {
			case "create":
				return await createBill(req, res);
			case "update":
				return await updateBill(req, res);
			default:
				const bills = await Bill.find({
					room_id: {
						$in: await Room.find({ landlord_id: req.user.id }).select("_id"),
					},
				})
					.populate("room_id")
					.populate("user_id");
				return res.json(bills);
		}
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
