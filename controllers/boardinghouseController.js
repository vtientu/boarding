const BoardingHouse = require("../models/BoardingHouse");
const Room = require("../models/Room");
const User = require("../models/User");
const mongoose = require("mongoose");

// Lấy tất cả nhà trọ
const getAllBoardingHouses = async (req, res) => {
	try {
		const { location, status, sort, page = 1, limit = 10 } = req.query;
		const query = {};

		// Filter theo location
		if (location) {
			query.location = { $regex: location, $options: "i" };
		}

		// Filter theo status
		if (status) {
			query.status = status;
		}

		// Pagination
		const options = {
			page: parseInt(page),
			limit: parseInt(limit),
			sort: {},
		};

		// Sorting
		if (sort) {
			const sortFields = sort.split(",");
			sortFields.forEach((field) => {
				const sortOrder = field.startsWith("-") ? -1 : 1;
				const fieldName = field.startsWith("-") ? field.substring(1) : field;
				options.sort[fieldName] = sortOrder;
			});
		} else {
			options.sort = { createdAt: -1 };
		}

		// Thực hiện query với pagination
		const skip = (page - 1) * limit;
		const boardingHouses = await BoardingHouse.find(query)
			.populate("landlord_id", "name username email phone")
			.sort(options.sort)
			.skip(skip)
			.limit(limit);

		const total = await BoardingHouse.countDocuments(query);

		res.status(200).json({
			data: boardingHouses,
			pagination: {
				total,
				page: options.page,
				limit: options.limit,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error getting boarding houses:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

// Lấy chi tiết nhà trọ
const getBoardingHouseDetail = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ msg: "Invalid boarding house ID" });
		}

		const boardingHouse = await BoardingHouse.findById(id).populate(
			"landlord_id",
			"name username email phone",
		);

		if (!boardingHouse) {
			return res.status(404).json({ msg: "Boarding house not found" });
		}

		// Lấy danh sách phòng trong nhà trọ
		const rooms = await Room.find({ boarding_house_id: id });

		res.status(200).json({
			boardingHouse,
			rooms,
		});
	} catch (error) {
		console.error("Error getting boarding house detail:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

// Tạo nhà trọ mới
const createBoardingHouse = async (req, res) => {
	try {
		const { location, status } = req.body;
		const userId = req.user.id; // Lấy từ middleware auth

		// Kiểm tra quyền
		const user = await User.findById(userId).populate("role_id");
		if (!user || user.role_id.role_name !== "Owner") {
			return res
				.status(403)
				.json({
					msg: "Permission denied. Only owners can create boarding houses",
				});
		}

		// Tạo boarding house mới
		const newBoardingHouse = new BoardingHouse({
			location,
			status,
			landlord_id: userId,
			total_income: 0,
			empty_rooms: 0,
			occupied_rooms: 0,
		});

		await newBoardingHouse.save();

		res
			.status(201)
			.json({
				msg: "Boarding house created successfully",
				boardingHouse: newBoardingHouse,
			});
	} catch (error) {
		console.error("Error creating boarding house:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

// Cập nhật nhà trọ
const updateBoardingHouse = async (req, res) => {
	try {
		const { id } = req.params;
		const { location, status } = req.body;
		const userId = req.user.id;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ msg: "Invalid boarding house ID" });
		}

		// Kiểm tra quyền
		const user = await User.findById(userId).populate("role_id");
		if (!user || user.role_id.role_name !== "Owner") {
			return res.status(403).json({ msg: "Permission denied" });
		}

		const boardingHouse = await BoardingHouse.findById(id);
		if (!boardingHouse) {
			return res.status(404).json({ msg: "Boarding house not found" });
		}

		// Chỉ chủ trọ mới có thể cập nhật
		if (boardingHouse.landlord_id.toString() !== userId) {
			return res
				.status(403)
				.json({
					msg: "Permission denied. You are not the owner of this boarding house",
				});
		}

		const updatedBoardingHouse = await BoardingHouse.findByIdAndUpdate(
			id,
			{ location, status },
			{ new: true, runValidators: true },
		);

		res
			.status(200)
			.json({
				msg: "Boarding house updated successfully",
				boardingHouse: updatedBoardingHouse,
			});
	} catch (error) {
		console.error("Error updating boarding house:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

// Xóa nhà trọ
const deleteBoardingHouse = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ msg: "Invalid boarding house ID" });
		}

		// Kiểm tra quyền
		const user = await User.findById(userId).populate("role_id");
		if (!user || user.role_id.role_name !== "Owner") {
			return res.status(403).json({ msg: "Permission denied" });
		}

		const boardingHouse = await BoardingHouse.findById(id);
		if (!boardingHouse) {
			return res.status(404).json({ msg: "Boarding house not found" });
		}

		// Chỉ chủ trọ mới có thể xóa
		if (boardingHouse.landlord_id.toString() !== userId) {
			return res
				.status(403)
				.json({
					msg: "Permission denied. You are not the owner of this boarding house",
				});
		}

		// Xóa tất cả phòng trong nhà trọ
		await Room.deleteMany({ boarding_house_id: id });

		// Xóa nhà trọ
		await BoardingHouse.findByIdAndDelete(id);

		res
			.status(200)
			.json({ msg: "Boarding house and all its rooms deleted successfully" });
	} catch (error) {
		console.error("Error deleting boarding house:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

// Tìm kiếm nhà trọ
const searchBoardingHouses = async (req, res) => {
	try {
		const {
			keyword,
			location,
			minRooms,
			maxRooms,
			status,
			page = 1,
			limit = 10,
		} = req.query;
		const query = {};

		// Tìm kiếm theo từ khóa (location)
		if (keyword) {
			query.$or = [{ location: { $regex: keyword, $options: "i" } }];
		}

		// Filter theo location
		if (location) {
			query.location = { $regex: location, $options: "i" };
		}

		// Filter theo status
		if (status) {
			query.status = status;
		}

		// Filter theo số phòng
		if (minRooms || maxRooms) {
			query.$and = [];

			if (minRooms) {
				query.$and.push({
					$expr: {
						$gte: [
							{ $add: ["$empty_rooms", "$occupied_rooms"] },
							parseInt(minRooms),
						],
					},
				});
			}

			if (maxRooms) {
				query.$and.push({
					$expr: {
						$lte: [
							{ $add: ["$empty_rooms", "$occupied_rooms"] },
							parseInt(maxRooms),
						],
					},
				});
			}
		}

		// Thực hiện query với pagination
		const skip = (page - 1) * limit;
		const boardingHouses = await BoardingHouse.find(query)
			.populate("landlord_id", "name username email phone")
			.skip(skip)
			.limit(parseInt(limit))
			.sort({ createdAt: -1 });

		const total = await BoardingHouse.countDocuments(query);

		res.status(200).json({
			data: boardingHouses,
			pagination: {
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error searching boarding houses:", error);
		res.status(500).json({ msg: "Server error", error: error.message });
	}
};

module.exports = {
	getAllBoardingHouses,
	getBoardingHouseDetail,
	createBoardingHouse,
	updateBoardingHouse,
	deleteBoardingHouse,
	searchBoardingHouses,
};
