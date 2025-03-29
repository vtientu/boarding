const BoardingHouse = require("../models/BoardingHouse");
const Room = require("../models/Room");
const User = require("../models/User");
const Role = require("../models/Role");

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
		console.log(user);
		if (!user || user.role_id.role_name !== "Owner") {
			return res.status(403).json({
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

		res.status(201).json({
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
			return res.status(403).json({
				msg: "Permission denied. You are not the owner of this boarding house",
			});
		}

		const updatedBoardingHouse = await BoardingHouse.findByIdAndUpdate(
			id,
			{ location, status },
			{ new: true, runValidators: true },
		);

		res.status(200).json({
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
			return res.status(403).json({
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

// Function để chủ trọ xem danh sách nhà trọ của mình
const getMyBoardingHouses = async (req, res) => {
	try {
		const userId = req.user.id;

		// Kiểm tra quyền - chỉ chủ trọ mới có thể xem nhà trọ của mình
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				msg: "User not found",
			});
		}

		// Lấy thông tin role
		const userRole = await Role.findById(user.role_id);
		if (!userRole || userRole.role_name !== "Owner") {
			return res.status(403).json({
				msg: "Permission denied. Only owners can access this resource",
			});
		}

		// Xử lý pagination và filter
		const { location, status, sort, page = 1, limit = 10 } = req.query;
		const query = { landlord_id: userId };

		// Filter theo location
		if (location) {
			query.location = { $regex: location, $options: "i" };
		}

		// Filter theo status
		if (status) {
			query.status = status;
		}

		// Cấu hình sorting
		let sortOptions = { createdAt: -1 }; // Mặc định sắp xếp theo thời gian tạo giảm dần

		if (sort) {
			sortOptions = {};
			const sortFields = sort.split(",");
			sortFields.forEach((field) => {
				const sortOrder = field.startsWith("-") ? -1 : 1;
				const fieldName = field.startsWith("-") ? field.substring(1) : field;
				sortOptions[fieldName] = sortOrder;
			});
		}

		// Tính toán skip cho pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Thực hiện query
		const boardingHouses = await BoardingHouse.find(query)
			.populate("landlord_id", "name username email phone")
			.sort(sortOptions)
			.skip(skip)
			.limit(parseInt(limit));

		// Tổng số nhà trọ của chủ này
		const total = await BoardingHouse.countDocuments(query);

		// Thêm thông tin tổng hợp
		const summary = {
			totalBoardingHouses: total,
			totalRooms: 0,
			occupiedRooms: 0,
			emptyRooms: 0,
			totalIncome: 0,
		};

		// Tính tổng số phòng và tổng thu nhập từ tất cả nhà trọ
		const allBoardingHouses = await BoardingHouse.find({ landlord_id: userId });
		allBoardingHouses.forEach((bh) => {
			summary.totalRooms += bh.empty_rooms + bh.occupied_rooms;
			summary.occupiedRooms += bh.occupied_rooms;
			summary.emptyRooms += bh.empty_rooms;
			summary.totalIncome += bh.total_income;
		});

		res.status(200).json({
			data: boardingHouses,
			pagination: {
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				pages: Math.ceil(total / parseInt(limit)),
			},
			summary,
		});
	} catch (error) {
		console.error("Error getting my boarding houses:", error);
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
	getMyBoardingHouses,
};
