const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Payment = require("../models/Payment");
const Bill = require("../models/Bill");
require("dotenv").config();
const { VNPay } = require('vnpay')

class PaymentService {
	constructor() {
		// VNPay configuration
		this.vnp_TmnCode = process.env.VNP_TMN_CODE; // Mã website tại VNPay
		this.vnp_HashSecret = process.env.VNP_HASH_SECRET; // Secret key
		this.vnp_Url =
			process.env.VNP_URL ||
			"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
		this.vnp_ReturnUrl =
			process.env.VNP_RETURN_URL ||
			"http://localhost:3000/api/payments/vnpay-return";
		this.vnp_ApiUrl =
			process.env.VNP_API_URL ||
			"https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
		this.vnpay = new VNPay({
			tmnCode: this.vnp_TmnCode,
			secureSecret: this.vnp_HashSecret,
			testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
			hashAlgorithm: 'SHA512', // tùy chọn

			/**
			 * Bật/tắt ghi log
			 * Nếu enableLog là false, loggerFn sẽ không được sử dụng trong bất kỳ phương thức nào
			 */
			enableLog: true, // tùy chọn
		});
	}
	/**
	 * Tạo một giao dịch thanh toán VNPay
	 * @param {Object} data - Dữ liệu thanh toán
	 * @returns {String} - URL thanh toán
	*/
	async createVnpayPayment(data) {
		try {
			if (!this.vnp_HashSecret || !this.vnp_TmnCode || !this.vnp_Url || !this.vnp_ReturnUrl) {
				throw new Error("Missing VNPay configuration");
			}
			const { billId, userId, contractId, totalAmount, ipAddress } = data;

			// Kiểm tra hóa đơn
			const bill = await Bill.findById(billId);
			if (!bill) {
				throw new Error("Hóa đơn không tồn tại");
			}

			// Tạo mã giao dịch duy nhất
			const transactionCode = `VNP${moment().format(
				"YYYYMMDDHHmmss",
			)}${uuidv4().substring(0, 8)}`;

			// Tạo bản ghi payment với status=Pending
			const payment = new Payment({
				bill_id: billId,
				user_id: userId,
				contract_id: contractId,
				payment_method: "Online Payment",
				total_amount: totalAmount,
				payment_status: "Pending",
				transaction_code: transactionCode,
			});

			bill.status = "Pending";
			await bill.save();

			await payment.save();

			// Thông tin VNPay
			const vnp_Params = {
				vnp_TxnRef: transactionCode,
				vnp_OrderInfo: `Thanh toan hoa don tien phong ${bill.room_id}`,
				vnp_OrderType: "billpayment",
				vnp_Amount: totalAmount, // Nhân 100 vì VNPay yêu cầu số tiền * 100
				vnp_IpAddr: ipAddress,
				vnp_ReturnUrl: this.vnp_ReturnUrl,
				vnp_Locale: "vn",
				vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
				vnp_CurrCode: "VND",
			};

			const paymentUrl = this.vnpay.buildPaymentUrl(vnp_Params)


			return {
				paymentUrl,
				transactionCode,
			};
		} catch (error) {
			console.error("Create VNPay payment error:", error);
			throw error;
		}
	}

	/**
	 * Xử lý callback từ VNPay
	 * @param {Object} vnpParams - Tham số trả về từ VNPay
	 * @returns {Object} - Kết quả xử lý
	 */
	async processVnpayReturn(vnpParams) {
		try {
			const verify = this.vnpay.verifyReturnUrl(vnpParams);
			console.log(verify);

			if (!verify.isVerified) {
				return {
					code: verify.code,
					message: 'Xác thực tính toàn vẹn dữ liệu thất bại',
				};
			}
			if (!verify.isSuccess) {
				return res.send('Đơn hàng thanh toán thất bại');
			}

			// Tìm giao dịch trong database
			const payment = await Payment.findOne({
				transaction_code: vnpParams.vnp_TxnRef,
			});

			if (!payment) {
				return {
					code: "01",
					message: "Transaction not found",
				};
			}

			// Nếu giao dịch đã xử lý trước đó, trả về mã thành công
			if (payment.payment_status === "Completed") {
				return {
					code: "00",
					message: "Transaction already processed",
					paymentId: payment._id,
				};
			}

			// Cập nhật trạng thái thanh toán
			payment.payment_status = "Completed";
			payment.payment_date = new Date();
			await payment.save();

			const bill = await Bill.findById(payment.bill_id);
			bill.status = "Paid";
			await bill.save();

			return {
				code: "00",
				message: "Transaction successful",
				paymentId: payment._id,
			};
		} catch (error) {
			console.error("Process VNPay return error:", error);
			return {
				code: "99",
				message: "System error",
			};
		}
	}

	/**
	 * Kiểm tra trạng thái giao dịch thông qua API VNPay
	 * @param {String} transactionCode - Mã giao dịch
	 * @returns {Object} - Kết quả
	 */
	async checkVnpayTransaction(transactionCode) {
		try {
			const vnp_RequestData = {
				vnp_Version: "2.1.0",
				vnp_Command: "querydr",
				vnp_TmnCode: this.vnp_TmnCode,
				vnp_TxnRef: transactionCode,
				vnp_OrderInfo: `Kiem tra giao dich ${transactionCode}`,
				vnp_TransactionDate: moment().format("YYYYMMDDHHmmss"),
				vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
				vnp_IpAddr: "127.0.0.1",
			};

			// Sắp xếp các tham số
			const sortedParams = this.sortObject(vnp_RequestData);

			// Tạo chuỗi ký tự cần ký
			const signData = qs.stringify(sortedParams, { encode: false });

			// Tạo chữ ký
			const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
			const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

			// Thêm chữ ký vào params
			sortedParams.vnp_SecureHash = signed;

			// Gọi API kiểm tra giao dịch
			const response = await axios.post(
				this.vnp_ApiUrl,
				qs.stringify(sortedParams),
			);

			// Xử lý kết quả
			const payment = await Payment.findOne({
				transaction_code: transactionCode,
			});

			if (!payment) {
				return {
					code: "01",
					message: "Transaction not found",
				};
			}

			if (response.data.vnp_ResponseCode === "00") {
				// Cập nhật trạng thái thanh toán nếu thành công
				payment.payment_status = "Completed";
				payment.payment_date = new Date();
				await payment.save();
			} else if (payment.payment_status !== "Completed") {
				// Cập nhật thành thất bại nếu chưa thành công
				payment.payment_status = "Failed";
				await payment.save();
			}

			return {
				code: response.data.vnp_ResponseCode,
				message: response.data.vnp_Message,
				paymentId: payment._id,
			};
		} catch (error) {
			console.error("Check VNPay transaction error:", error);
			return {
				code: "99",
				message: "System error",
			};
		}
	}

	/**
	 * Sắp xếp object theo key
	 * @param {Object} obj - Object cần sắp xếp
	 * @returns {Object} - Object đã sắp xếp
	 */
	sortObject(obj) {
		const sorted = {};
		const keys = Object.keys(obj).sort();

		for (const key of keys) {
			if (obj[key] !== "" && obj[key] !== null && obj[key] !== undefined) {
				sorted[key] = obj[key];
			}
		}

		return sorted;
	}
}

module.exports = new PaymentService();
