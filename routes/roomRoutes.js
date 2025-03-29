const express = require("express");
const router = express.Router();
const {
	getAllRooms,
	getRoomDetail,
	createRoom,
	updateRoom,
	deleteRoom,
	searchRooms,
	getOwnerRooms,
	getRoomsByBoardingHouse,
} = require("../controllers/roomController");
const authMiddleware = require("../middleware/auth");

// Lấy tất cả phòng và tìm kiếm phòng (public)
router.get("/", getAllRooms); // done
router.get("/search", searchRooms); // done

// Lấy tất cả phòng của owner đăng nhập
router.get("/owner", authMiddleware, getOwnerRooms); // done

// Lấy chi tiết phòng (public)
router.get("/detail/:id", getRoomDetail); //done

// Lấy danh sách phòng theo boarding house ID
router.get("/boardinghouse/:boarding_house_id", getRoomsByBoardingHouse); //done

// Các route cần đăng nhập
router.post("/create/", authMiddleware, createRoom); //done
router.patch("/update/:id", authMiddleware, updateRoom); //done
router.delete("/:id", authMiddleware, deleteRoom); // done

module.exports = router;
