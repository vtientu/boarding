const { isValidObjectId } = require("mongoose");
const Contract = require("../models/Contract");
const Room = require("../models/Room");

exports.getContractByUid = async (req, res) => {
	const { userId } = req.params;
	if (!isValidObjectId(userId)) {
		return res.status(400).json({ message: "Invalid user ID" });
	}
	const contract = await Contract.findOne({ user_id: userId });
	res.status(200).json(contract);
};

exports.getContractByRoomId = async (req, res) => {
	const { roomId } = req.params;
	if (!isValidObjectId(roomId)) {
		return res.status(400).json({ message: "Invalid room ID" });
	}
	const contract = await Contract.findOne({ room_id: roomId }).populate("room_id", "room_number room_type").populate("user_id", "name phone");
	res.status(200).json(contract);
};

exports.createContract = async (req, res) => {
	try {
		const { room_id, room_type, user_id, start_date, rental_period, rental_price, deposit } = req.body;
		const end_date = new Date(start_date);
		end_date.setMonth(end_date.getMonth() + rental_period);
		const contract = await Contract.create({
			room_id, room_type, user_id, start_date, end_date, rental_price, deposit, end_date, rental_period
		});
		await Room.findByIdAndUpdate(room_id, { tenant_id: user_id });
		res.status(201).json(contract);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


