const { isValidObjectId } = require("mongoose");
const Contract = require("../models/Contract");
const Room = require("../models/Room");

exports.getContracts = async (req, res) => {
  const { status, search } = req.query;

  const page = req.query?.page ?? 1;
  const limit = req.query?.limit ?? 10;
  const skip = (page - 1) * limit;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$text = search;
  }

  const contracts = await Contract.find(query)
    .skip(skip)
    .limit(limit)
    .populate("room_id", "room_number room_type")
    .populate("user_id", "name phone");

  const total = await Contract.countDocuments(query);

  res.status(200).json({
    data: contracts,
    totalData: total,
  });
};

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
  const contract = await Contract.findOne({ room_id: roomId })
    .populate("room_id", "room_number room_type")
    .populate("user_id", "name phone");
  res.status(200).json(contract);
};

exports.createContract = async (req, res) => {
  try {
    const {
      room_id,
      user_id,
      start_date,
      rental_period,
      rental_price,
      deposit,
      description,
    } = req.body;
    const end_date = new Date(start_date);
    end_date.setMonth(end_date.getMonth() + rental_period);
    const contract = await Contract.create({
      room_id,
      user_id,
      start_date,
      end_date,
      rental_price,
      deposit,
      description,
      end_date,
      rental_period,
    });
    await Room.findByIdAndUpdate(room_id, {
      tenant_id: user_id,
      status: "Occupied",
    });

    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const {
      room_id,
      room_type,
      user_id,
      start_date,
      rental_period,
      rental_price,
      deposit,
    } = req.body;
    const contract = await Contract.findByIdAndUpdate(contractId, {
      room_id,
      room_type,
      user_id,
      start_date,
      rental_period,
      rental_price,
      deposit,
    });
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
