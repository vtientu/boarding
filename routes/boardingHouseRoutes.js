const express = require("express");
const router = express.Router();
const {
	getAllBoardingHouses,
	getBoardingHouseDetail,
	createBoardingHouse,
	updateBoardingHouse,
	deleteBoardingHouse,
	searchBoardingHouses,
} = require("../controllers/boardinghouseController");
const authMiddleware = require("../middleware/auth");

// Lấy tất cả nhà trọ và tìm kiếm nhà trọ (public)
router.get("/", getAllBoardingHouses);
router.get("/search", searchBoardingHouses);

// Lấy chi tiết nhà trọ (public)
router.get("/:id", getBoardingHouseDetail);

// Các route cần đăng nhập
router.post("/", authMiddleware, createBoardingHouse);
router.patch("/:id", authMiddleware, updateBoardingHouse);
router.delete("/:id", authMiddleware, deleteBoardingHouse);

module.exports = router;
