const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
	getPayments,
	getPaymentById,
	createPaymentRequest,
	vnpayReturn,
	vnpayIpn,
	checkPaymentStatus,
	updatePaymentStatus,
} = require("../controllers/paymentController");

// Routes yêu cầu xác thực
router.get("/", authMiddleware, getPayments);
router.get("/:id", authMiddleware, getPaymentById);
router.post("/create", authMiddleware, createPaymentRequest);
router.get("/check/:transactionCode", authMiddleware, checkPaymentStatus);
router.put("/:id/status", authMiddleware, updatePaymentStatus);

// Routes công khai cho callback từ VNPay
router.get("/vnpay/return", vnpayReturn);
router.get("/vnpay/ipn", vnpayIpn);

module.exports = router;
