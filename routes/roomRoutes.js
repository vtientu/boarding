const express = require("express");
const router = express.Router();
const {
	getAllRooms,
	getRoomDetail,
	createRoom,
	updateRoom,
	deleteRoom,
	searchRooms,
} = require("../controllers/roomController");
const authMiddleware = require("../middleware/auth");

// Lấy tất cả phòng và tìm kiếm phòng (public)
router.get("/", getAllRooms);
router.get("/search", searchRooms);

// Lấy chi tiết phòng (public)
router.get("/:id", getRoomDetail);

// Các route cần đăng nhập
router.post("/", authMiddleware, createRoom);
router.patch("/:id", authMiddleware, updateRoom);
router.delete("/:id", authMiddleware, deleteRoom);

module.exports = router;
