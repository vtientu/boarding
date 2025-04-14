const express = require("express");
const authenticationMiddleware = require("../middleware/auth");
const {
	getContractByUid,
	getContractByRoomId,
	createContract,
	updateContract,
	getContracts,
} = require("../controllers/contractController");
const router = express.Router();

router.get("/", authenticationMiddleware, getContracts);
router.get("/user/:userId", authenticationMiddleware, getContractByUid);
router.get("/room/:roomId", authenticationMiddleware, getContractByRoomId);
router.post("/create", authenticationMiddleware, createContract);
router.put("/update/:contractId", authenticationMiddleware, updateContract);


module.exports = router;
