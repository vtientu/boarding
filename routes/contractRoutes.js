const express = require("express");
const authenticationMiddleware = require("../middleware/auth");
const {
	getContractByUid,
	getContractByRoomId,
	createContract,
} = require("../controllers/contractController");
const router = express.Router();

router.get("/user/:userId", authenticationMiddleware, getContractByUid);
router.get("/room/:roomId", authenticationMiddleware, getContractByRoomId);
router.post("/create", authenticationMiddleware, createContract);


module.exports = router;
