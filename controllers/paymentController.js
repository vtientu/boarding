const Payment = require("../models/Payment");
const Bill = require("../models/Bill");
const Contract = require("../models/Contract");
const paymentService = require("../services/paymentService");
const { isValidObjectId } = require("mongoose");

/**
 * Lấy danh sách thanh toán
 */
const getPayments = async (req, res) => {
	try {
		// Phân trang
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		// Lọc theo người dùng nếu không phải admin
		let query = {};
		if (req.user.role !== "Admin" && req.user.role !== "Owner") {
			query.user_id = req.user.id;
		}

		// Lọc theo trạng thái nếu có
		if (req.query.status) {
			query.payment_status = req.query.status;
		}

		// Lấy tổng số thanh toán
		const total = await Payment.countDocuments(query);

		// Lấy danh sách thanh toán
		const payments = await Payment.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate("bill_id", "room_id room_price payment_deadline")
			.populate("user_id", "name username email")
			.populate({
				path: "bill_id",
				populate: {
					path: "room_id",
					select: "room_number room_name",
				},
			});

		res.status(200).json({
			success: true,
			count: payments.length,
			total,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			data: payments,
		});
	} catch (error) {
		console.error("Get payments error:", error);
		res.status(500).json({
			success: false,
			message: "Lỗi server khi lấy danh sách thanh toán",
			error: error.message,
		});
	}
};

/**
 * Lấy chi tiết thanh toán
 */
const getPaymentById = async (req, res) => {
	try {
		if (!req.params.id || !isValidObjectId(req.params.id)) {
			return res.status(400).json({
				success: false,
				message: "ID thanh toán không hợp lệ",
			});
		}
		const payment = await Payment.findById(req.params.id)
			.populate("bill_id", "room_id room_price payment_deadline details")
			.populate("user_id", "name username email phone")
			.populate("contract_id", "start_date end_date deposit_amount")
			.populate({
				path: "bill_id",
				populate: {
					path: "room_id",
					select: "room_number room_name building_id",
				},
			});

		if (!payment) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy thanh toán",
			});
		}

		// Kiểm tra quyền truy cập
		if (
			req.user.role !== "Admin" &&
			req.user.role !== "Owner" &&
			payment.user_id._id.toString() !== req.user.id
		) {
			return res.status(403).json({
				success: false,
				message: "Không có quyền truy cập",
			});
		}

		res.status(200).json({
			success: true,
			data: payment,
		});
	} catch (error) {
		console.error("Get payment error:", error);
		res.status(500).json({
			success: false,
			message: "Lỗi server khi lấy chi tiết thanh toán",
			error: error.message,
		});
	}
};

/**
 * Tạo yêu cầu thanh toán
 */
const createPaymentRequest = async (req, res) => {
	try {
		const { billId, paymentMethod } = req.body;

		// Kiểm tra dữ liệu đầu vào
		if (!billId || !paymentMethod) {
			return res.status(400).json({
				success: false,
				message: "Vui lòng cung cấp ID hóa đơn và phương thức thanh toán",
			});
		}

		// Kiểm tra hóa đơn
		const bill = await Bill.findById(billId);
		if (!bill) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy hóa đơn",
			});
		}
		// Kiểm tra quyền (chỉ người thuê tương ứng mới được thanh toán)
		if (
			bill.tenant_id.toString() !== req.user.id &&
			req.user.role !== "Admin" &&
			req.user.role !== "Owner"
		) {
			return res.status(403).json({
				success: false,
				message: "Không có quyền thanh toán hóa đơn này",
			});
		}

		// Tìm hợp đồng tương ứng
		const contract = await Contract.findOne({
			room_id: bill.room_id,
			tenant_id: bill.user_id,
		});

		if (!contract) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy hợp đồng cho phòng này",
			});
		}

		// Tính tổng tiền
		const totalAmount =
			bill.room_price +
			bill.electricity +
			bill.water +
			bill.additional_services;

		// Xử lý theo phương thức thanh toán
		if (paymentMethod === "Online Payment") {
			// Tạo giao dịch VNPay
			const paymentData = {
				billId: bill._id,
				userId: req.user.id,
				contractId: contract._id,
				totalAmount,
				ipAddress: req.ip || "127.0.0.1",
			};

			const vnpayResult = await paymentService.createVnpayPayment(paymentData);

			res.status(200).json({
				success: true,
				message: "Đã tạo yêu cầu thanh toán",
				data: {
					paymentUrl: vnpayResult.paymentUrl,
					transactionCode: vnpayResult.transactionCode,
				},
			});
		} else {
			// Phương thức thanh toán khác (mặc định là Pending)
			const payment = new Payment({
				bill_id: bill._id,
				user_id: req.user.id,
				contract_id: contract._id,
				payment_method: paymentMethod,
				total_amount: totalAmount,
				payment_status: "Pending",
				transaction_code: `${paymentMethod
					.substring(0, 3)
					.toUpperCase()}${Date.now()}`,
			});

			await payment.save();

			bill.status = "Pending";
			await bill.save();

			res.status(201).json({
				success: true,
				message: "Đã tạo yêu cầu thanh toán",
				data: payment,
			});
		}
	} catch (error) {
		console.error("Create payment error:", error);
		res.status(500).json({
			success: false,
			message: "Lỗi server khi tạo yêu cầu thanh toán",
			error: error.message,
		});
	}
};

/**
 * Xử lý callback từ VNPay
 */
const vnpayReturn = async (req, res) => {
	try {
		const vnpParams = req.query;
		const result = await paymentService.processVnpayReturn(vnpParams);

		// Chuyển hướng về trang thành công hoặc thất bại tùy thuộc vào kết quả
		if (result.code === "00") {
			// Thành công - chuyển hướng đến trang thành công
			return res.redirect(
				`${process.env.FRONTEND_URL}/payment?type=success&paymentId=${result.paymentId}`,
			);
		} else {
			// Thất bại - chuyển hướng đến trang thất bại
			return res.redirect(
				`${process.env.FRONTEND_URL}/payment?type=failed&code=${result.code}&message=${result.message}`,
			);
		}
	} catch (error) {
		console.error("VNPay return error:", error);
		return res.redirect(
			`${process.env.FRONTEND_URL}/payment/failed?code=99&message=System%20error`,
		);
	}
};

/**
 * IPN (Instant Payment Notification) từ VNPay
 */
const vnpayIpn = async (req, res) => {
	try {
		const vnpParams = req.query;
		const result = await paymentService.processVnpayReturn(vnpParams);

		res.status(200).json({
			RspCode: result.code,
			Message: result.message,
		});
	} catch (error) {
		console.error("VNPay IPN error:", error);
		res.status(200).json({
			RspCode: "99",
			Message: "System error",
		});
	}
};

/**
 * Kiểm tra trạng thái thanh toán
 */
const checkPaymentStatus = async (req, res) => {
	try {
		const { transactionCode } = req.params;

		// Tìm thanh toán trong hệ thống
		const payment = await Payment.findOne({
			transaction_code: transactionCode,
		});

		if (!payment) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy giao dịch",
			});
		}

		// Nếu thanh toán đã hoàn thành hoặc thất bại, trả về trạng thái
		if (payment.payment_status !== "Pending") {
			return res.status(200).json({
				success: true,
				data: {
					status: payment.payment_status,
					payment: payment,
				},
			});
		}

		// Nếu thanh toán đang xử lý và là VNPay, kiểm tra với VNPay
		if (payment.payment_method === "Online Payment") {
			const result = await paymentService.checkVnpayTransaction(
				transactionCode,
			);

			return res.status(200).json({
				success: true,
				data: {
					status: payment.payment_status, // Đã được cập nhật trong hàm checkVnpayTransaction
					payment: await Payment.findById(payment._id),
				},
			});
		}

		res.status(200).json({
			success: true,
			data: {
				status: payment.payment_status,
				payment: payment,
			},
		});
	} catch (error) {
		console.error("Check payment status error:", error);
		res.status(500).json({
			success: false,
			message: "Lỗi server khi kiểm tra trạng thái thanh toán",
			error: error.message,
		});
	}
};

/**
 * Cập nhật trạng thái thanh toán (dành cho admin/chủ trọ)
 */
const updatePaymentStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		// Kiểm tra quyền
		if (req.user.role !== "Admin" && req.user.role !== "Owner") {
			return res.status(403).json({
				success: false,
				message: "Không có quyền cập nhật trạng thái thanh toán",
			});
		}

		// Kiểm tra dữ liệu đầu vào
		if (!status || !["Pending", "Completed", "Failed"].includes(status)) {
			return res.status(400).json({
				success: false,
				message:
					"Trạng thái không hợp lệ, chỉ chấp nhận: Pending, Completed, Failed",
			});
		}

		// Tìm thanh toán
		const payment = await Payment.findById(id);
		if (!payment) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy thanh toán",
			});
		}

		// Cập nhật trạng thái
		payment.payment_status = status;
		if (status === "Completed") {
			payment.payment_date = new Date();
		}

		await payment.save();

		res.status(200).json({
			success: true,
			message: "Đã cập nhật trạng thái thanh toán",
			data: payment,
		});
	} catch (error) {
		console.error("Update payment status error:", error);
		res.status(500).json({
			success: false,
			message: "Lỗi server khi cập nhật trạng thái thanh toán",
			error: error.message,
		});
	}
};

module.exports = {
	getPayments,
	getPaymentById,
	createPaymentRequest,
	vnpayReturn,
	vnpayIpn,
	checkPaymentStatus,
	updatePaymentStatus,
};
