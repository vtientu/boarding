const { isValidObjectId } = require("mongoose");
const Contract = require("../models/Contract");

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
	const contract = await Contract.findOne({ room_id: roomId });
	res.status(200).json(contract);
};
