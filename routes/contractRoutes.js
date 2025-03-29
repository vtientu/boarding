const express = require("express");
const authenticationMiddleware = require("../middleware/auth");
const {
	getContractByUid,
	getContractByRoomId,
} = require("../controllers/contractController");
const router = express.Router();

router.get("/user/:userId", authenticationMiddleware, getContractByUid);
router.get("/room/:roomId", authenticationMiddleware, getContractByRoomId);

module.exports = router;
