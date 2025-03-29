const Room = require("../models/Room");
const BoardingHouse = require("../models/BoardingHouse");
const User = require("../models/User");
const mongoose = require("mongoose");

// Lấy tất cả phòng
const getAllRooms = async (req, res) => {
	try {
		const {
			status,
			room_type,
			min_price,
			max_price,
			boarding_house_id,
			sort,
			page = 1,
			limit = 10,
		} = req.query;

		const query = {};

		// Filter theo status
		if (status) {
			query.status = status;
		}

		// Filter theo room_type
		if (room_type) {
			query.room_type = room_type;
		}

		// Filter theo giá
		if (min_price || max_price) {
			query.month_rent = {};

			if (min_price) {
				query.month_rent.$gte = parseInt(min_price);
			}

			if (max_price) {
				query.month_rent.$lte = parseInt(max_price);
			}
		}

		// Filter theo boarding_house_id
		if (boarding_house_id) {
			query.boarding_house_id = boarding_house_id;
		}

		// Sorting
		let sortOption = { createdAt: -1 };
		if (sort) {
			const sortFields = sort.split(",");
			sortOption = {};
			sortFields.forEach((field) => {
				const sortOrder = field.startsWith("-") ? -1 : 1;
				const fieldName = field.startsWith("-") ? field.substring(1) : field;
				sortOption[fieldName] = sortOrder;
			});
		}

		// Thực hiện query với pagination
		const skip = (page - 1) * limit;
		const rooms = await Room.find(query)
			.populate("boarding_house_id", "location status")
			.populate("landlord_id", "name username email phone")
			.sort(sortOption)
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Room.countDocuments(query);

		res.status(200).json({
			data: rooms,
			pagination: {
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error getting rooms:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

// Lấy chi tiết phòng
const getRoomDetail = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ msg: "Invalid room ID" });
		}

		const room = await Room.findById(id)
			.populate("boarding_house_id", "location status")
			.populate("landlord_id", "name username email phone");

		if (!room) {
			return res.status(404).json({ msg: "Room not found" });
		}

		res.status(200).json({ room });
	} catch (error) {
		console.error("Error getting room detail:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

// Tạo phòng mới
const createRoom = async (req, res) => {
	try {
		const {
			room_number,
			room_type,
			status,
			capacity,
			month_rent,
			description,
			address,
			boarding_house_id,
		} = req.body;

		const userId = req.user.id;

		// Kiểm tra quyền
		const user = await User.findById(userId).populate("role_id");
		if (!user || user.role_id.role_name !== "Owner") {
			return res
				.status(403)
				.json({ msg: "Permission denied. Only owners can create rooms" });
		}

		// Kiểm tra boarding house tồn tại và thuộc về người dùng hiện tại
		const boardingHouse = await BoardingHouse.findById(boarding_house_id);
		if (!boardingHouse) {
			return res.status(404).json({ msg: "Boarding house not found" });
		}

		if (boardingHouse.landlord_id.toString() !== userId) {
			return res.status(403).json({
				msg: "Permission denied. You are not the owner of this boarding house",
			});
		}

		// Tạo phòng mới
		const newRoom = new Room({
			room_number,
			room_type,
			status,
			capacity,
			month_rent,
			description,
			address: address || boardingHouse.location,
			landlord_id: userId,
			boarding_house_id,
		});

		await newRoom.save();

		// Cập nhật số phòng trống trong boarding house
		if (status === "Available") {
			await BoardingHouse.findByIdAndUpdate(boarding_house_id, {
				$inc: { empty_rooms: 1 },
			});
		} else if (status === "Occupied") {
			await BoardingHouse.findByIdAndUpdate(boarding_house_id, {
				$inc: { occupied_rooms: 1 },
			});
		}

		res.status(201).json({ msg: "Room created successfully", room: newRoom });
	} catch (error) {
		console.error("Error creating room:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

// Cập nhật phòng
const updateRoom = async (req, res) => {
	try {
		const { id } = req.params;
		const {
			room_number,
			room_type,
			status,
			capacity,
			month_rent,
			description,
			address,
		} = req.body;

		const userId = req.user.id;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ msg: "Invalid room ID" });
		}

		// Kiểm tra quyền
		const user = await User.findById(userId).populate("role_id");
		if (!user || user.role_id.role_name !== "Owner") {
			return res.status(403).json({ msg: "Permission denied" });
		}

		const room = await Room.findById(id);
		if (!room) {
			return res.status(404).json({ msg: "Room not found" });
		}

		// Chỉ chủ trọ mới có thể cập nhật
		if (room.landlord_id.toString() !== userId) {
			return res
				.status(403)
				.json({ msg: "Permission denied. You are not the owner of this room" });
		}

		// Lưu lại status cũ để cập nhật số lượng phòng trong boarding house
		const oldStatus = room.status;

		const updatedRoom = await Room.findByIdAndUpdate(
			id,
			{
				room_number,
				room_type,
				status,
				capacity,
				month_rent,
				description,
				address,
			},
			{ new: true, runValidators: true },
		);

		// Cập nhật số phòng trong boarding house nếu status thay đổi
		if (status && status !== oldStatus) {
			const boardingHouse = await BoardingHouse.findById(
				room.boarding_house_id,
			);

			if (oldStatus === "Available" && status === "Occupied") {
				await BoardingHouse.findByIdAndUpdate(room.boarding_house_id, {
					$inc: {
						empty_rooms: -1,
						occupied_rooms: 1,
					},
				});
			} else if (oldStatus === "Occupied" && status === "Available") {
				await BoardingHouse.findByIdAndUpdate(room.boarding_house_id, {
					$inc: {
						empty_rooms: 1,
						occupied_rooms: -1,
					},
				});
			}
		}

		res
			.status(200)
			.json({ msg: "Room updated successfully", room: updatedRoom });
	} catch (error) {
		console.error("Error updating room:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

// Xóa phòng
const deleteRoom = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ msg: "Invalid room ID" });
		}

		// Kiểm tra quyền
		const user = await User.findById(userId).populate("role_id");
		if (!user || user.role_id.role_name !== "Owner") {
			return res.status(403).json({ msg: "Permission denied" });
		}

		const room = await Room.findById(id);
		if (!room) {
			return res.status(404).json({ msg: "Room not found" });
		}

		// Chỉ chủ trọ mới có thể xóa
		if (room.landlord_id.toString() !== userId) {
			return res
				.status(403)
				.json({ msg: "Permission denied. You are not the owner of this room" });
		}

		// Cập nhật số phòng trong boarding house
		if (room.status === "Available") {
			await BoardingHouse.findByIdAndUpdate(room.boarding_house_id, {
				$inc: { empty_rooms: -1 },
			});
		} else if (room.status === "Occupied") {
			await BoardingHouse.findByIdAndUpdate(room.boarding_house_id, {
				$inc: { occupied_rooms: -1 },
			});
		}

		// Xóa phòng
		await Room.findByIdAndDelete(id);

		res.status(200).json({ msg: "Room deleted successfully" });
	} catch (error) {
		console.error("Error deleting room:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

// Tìm kiếm phòng
const searchRooms = async (req, res) => {
	try {
		const {
			keyword,
			location,
			min_price,
			max_price,
			room_type,
			status,
			capacity,
			page = 1,
			limit = 10,
		} = req.query;

		const query = {};

		// Tìm kiếm theo từ khóa (description, address, room_number)
		if (keyword) {
			query.$or = [
				{ description: { $regex: keyword, $options: "i" } },
				{ address: { $regex: keyword, $options: "i" } },
				{ room_number: { $regex: keyword, $options: "i" } },
			];
		}

		// Filter theo location/address
		if (location) {
			query.address = { $regex: location, $options: "i" };
		}

		// Filter theo room_type
		if (room_type) {
			query.room_type = room_type;
		}

		// Filter theo status
		if (status) {
			query.status = status;
		}

		// Filter theo giá
		if (min_price || max_price) {
			query.month_rent = {};

			if (min_price) {
				query.month_rent.$gte = parseInt(min_price);
			}

			if (max_price) {
				query.month_rent.$lte = parseInt(max_price);
			}
		}

		// Filter theo sức chứa
		if (capacity) {
			query.capacity = { $gte: parseInt(capacity) };
		}

		// Thực hiện query với pagination
		const skip = (page - 1) * limit;
		const rooms = await Room.find(query)
			.populate("boarding_house_id", "location status")
			.populate("landlord_id", "name username email phone")
			.skip(skip)
			.limit(parseInt(limit))
			.sort({ createdAt: -1 });

		const total = await Room.countDocuments(query);

		res.status(200).json({
			data: rooms,
			pagination: {
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error searching rooms:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

// Lấy tất cả phòng của owner đang đăng nhập
// Lấy tất cả phòng của owner đang đăng nhập
const getOwnerRooms = async (req, res) => {
	try {
		const userId = req.user.id;

		// Kiểm tra quyền - chỉ owner mới có thể xem danh sách phòng của mình
		const user = await User.findById(userId).populate("role_id");
		if (!user || user.role_id.role_name !== "Owner") {
			return res.status(403).json({
				msg: "Permission denied. Only owners can access this resource",
			});
		}

		const {
			status,
			room_type,
			min_price,
			max_price,
			boarding_house_id,
			sort,
			page = 1,
			limit = 10,
		} = req.query;

		// Query cơ bản: tìm tất cả phòng của owner này
		const query = { landlord_id: userId };

		// Filter theo status
		if (status) {
			query.status = status;
		}

		// Filter theo room_type
		if (room_type) {
			query.room_type = room_type;
		}

		// Filter theo giá
		if (min_price || max_price) {
			query.month_rent = {};

			if (min_price) {
				query.month_rent.$gte = parseInt(min_price);
			}

			if (max_price) {
				query.month_rent.$lte = parseInt(max_price);
			}
		}

		// Filter theo boarding_house_id cụ thể
		if (boarding_house_id) {
			query.boarding_house_id = boarding_house_id;
		}

		// Sorting
		let sortOption = { createdAt: -1 };
		if (sort) {
			const sortFields = sort.split(",");
			sortOption = {};
			sortFields.forEach((field) => {
				const sortOrder = field.startsWith("-") ? -1 : 1;
				const fieldName = field.startsWith("-") ? field.substring(1) : field;
				sortOption[fieldName] = sortOrder;
			});
		}

		// Thực hiện query với pagination
		const skip = (page - 1) * limit;
		const rooms = await Room.find(query)
			.populate("boarding_house_id", "location status")
			.sort(sortOption)
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Room.countDocuments(query);

		// Tổng hợp thống kê
		const stats = {
			totalRooms: total,
			availableRooms: 0,
			occupiedRooms: 0,
			maintenanceRooms: 0,
			totalMonthlyIncome: 0,
		};

		// Lấy tất cả phòng của owner này (không phân trang) để tính thống kê
		const allRooms = await Room.find({ landlord_id: userId });

		allRooms.forEach((room) => {
			if (room.status === "Available") stats.availableRooms++;
			else if (room.status === "Occupied") {
				stats.occupiedRooms++;
				stats.totalMonthlyIncome += room.month_rent || 0;
			} else if (room.status === "Maintenance") stats.maintenanceRooms++;
		});

		// Chuyển đổi userId thành ObjectId
		const userObjectId = new mongoose.Types.ObjectId(userId);

		// Thống kê theo từng boarding house
		const boardingHouseStats = await Room.aggregate([
			{ $match: { landlord_id: userObjectId } },
			{
				$group: {
					_id: "$boarding_house_id",
					totalRooms: { $sum: 1 },
					availableRooms: {
						$sum: { $cond: [{ $eq: ["$status", "Available"] }, 1, 0] },
					},
					occupiedRooms: {
						$sum: { $cond: [{ $eq: ["$status", "Occupied"] }, 1, 0] },
					},
					maintenanceRooms: {
						$sum: { $cond: [{ $eq: ["$status", "Maintenance"] }, 1, 0] },
					},
					totalMonthlyIncome: {
						$sum: {
							$cond: [
								{ $eq: ["$status", "Occupied"] },
								{ $ifNull: ["$month_rent", 0] },
								0,
							],
						},
					},
				},
			},
			{
				$lookup: {
					from: "boardinghouses",
					localField: "_id",
					foreignField: "_id",
					as: "boardingHouseInfo",
				},
			},
			{
				$unwind: {
					path: "$boardingHouseInfo",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					_id: 1,
					boardingHouseLocation: {
						$ifNull: ["$boardingHouseInfo.location", "Unknown"],
					},
					totalRooms: 1,
					availableRooms: 1,
					occupiedRooms: 1,
					maintenanceRooms: 1,
					occupancyRate: {
						$cond: [
							{ $eq: ["$totalRooms", 0] },
							0,
							{
								$multiply: [
									{ $divide: ["$occupiedRooms", "$totalRooms"] },
									100,
								],
							},
						],
					},
					totalMonthlyIncome: 1,
				},
			},
		]);

		res.status(200).json({
			data: rooms,
			pagination: {
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				pages: Math.ceil(total / parseInt(limit)),
			},
			stats,
			boardingHouseStats,
		});
	} catch (error) {
		console.error("Error getting owner rooms:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

module.exports = {
	getAllRooms,
	getRoomDetail,
	createRoom,
	updateRoom,
	deleteRoom,
	searchRooms,
	getOwnerRooms,
};
