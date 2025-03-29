const express = require("express");
const router = express.Router();
const {
	getAllBoardingHouses,
	getBoardingHouseDetail,
	createBoardingHouse,
	updateBoardingHouse,
	deleteBoardingHouse,
	searchBoardingHouses,
	getMyBoardingHouses,
} = require("../controllers/boardinghouseController");
const authMiddleware = require("../middleware/auth");

// Lấy tất cả nhà trọ và tìm kiếm nhà trọ (public)
router.get("/", getAllBoardingHouses); // done
router.get("/search", searchBoardingHouses); // done

router.get("/my-boarding-houses", authMiddleware, getMyBoardingHouses); // done

// Lấy chi tiết nhà trọ (public)
router.get("/detail/:id", getBoardingHouseDetail); // done

// Các route cần đăng nhập
router.post("/create", authMiddleware, createBoardingHouse); // done
router.patch("/update/:id", authMiddleware, updateBoardingHouse); // done
router.delete("/:id", authMiddleware, deleteBoardingHouse); // done

module.exports = router;
