const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {
	sendPasswordResetEmail,
	sendWelcomeEmail,
} = require("../utils/emailService");

const login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			msg: "Bad request. Please add email and password in the request body",
		});
	}

	let foundUser = await User.findOne({ email: req.body.email });
	if (foundUser) {
		const isMatch = await foundUser.comparePassword(password);
		console.log("isMatch", isMatch);
		if (isMatch) {
			const token = jwt.sign(
				{ id: foundUser._id, name: foundUser.name },
				process.env.JWT_SECRET,
				{
					expiresIn: "30d",
				}
			);

			// Chuyển đối tượng Mongoose thành plain JavaScript object
			const userObj = foundUser.toObject();
			// Loại bỏ password
			const { password: _, ...userWithoutPassword } = userObj;

			return res
				.status(200)
				.json({ user: userWithoutPassword, msg: "user logged in", token });
		} else {
			return res.status(400).json({ msg: "Bad password" });
		}
	} else {
		return res.status(400).json({ msg: "Bad credentails" });
	}
};

// Đăng ký làm chủ trọ (Owner)
const registerOwner = async (req, res) => {
	try {
		// Kiểm tra email và username đã tồn tại chưa
		const emailExists = await User.findOne({ email: req.body.email });
		if (emailExists) {
			return res.status(400).json({ msg: "Email already in use" });
		}

		const usernameExists = await User.findOne({
			username: req.body.username,
		});
		if (usernameExists) {
			return res.status(400).json({ msg: "Username already taken" });
		}

		// Tìm role Owner
		let ownerRole = await Role.findOne({ role_name: "Owner" });

		// Nếu không tìm thấy role Owner, tạo mới
		if (!ownerRole) {
			ownerRole = await Role.create({
				role_name: "Owner",
				permissions: {
					view_rooms: true,
					manage_rooms: true,
					manage_tenants: true,
					manage_bills: true,
					generate_reports: true,
				},
			});
		}

		// Lấy dữ liệu từ request
		const { name, username, email, password, phone, address } = req.body;

		// Kiểm tra dữ liệu đầu vào
		if (!name || !username || !email || !password) {
			return res.status(400).json({
				msg: "Please provide name, username, email, and password",
			});
		}

		// Tạo người dùng mới với role Owner
		const newUser = new User({
			name,
			username,
			email,
			password,
			phone,
			address,
			role_id: ownerRole._id,
		});

		// Lưu người dùng
		await newUser.save();

		// Tạo token
		const token = jwt.sign(
			{ id: newUser._id, name: newUser.name },
			process.env.JWT_SECRET,
			{ expiresIn: "30d" }
		);

		// Gửi email chào mừng
		// await sendWelcomeEmail(newUser.email, newUser.name, "Owner");

		// Trả về response
		return res.status(201).json({
			user: {
				id: newUser._id,
				name: newUser.name,
				username: newUser.username,
				email: newUser.email,
				role: "Owner",
			},
			token,
		});
	} catch (error) {
		console.error("Registration error:", error);
		return res.status(500).json({
			msg: "Server error during registration",
			error: error.message,
		});
	}
};

// Đăng ký làm người thuê trọ (Tenant)
const registerTenant = async (req, res) => {
	try {
		// Kiểm tra email và username đã tồn tại chưa
		const emailExists = await User.findOne({ email: req.body.email });
		if (emailExists) {
			return res.status(400).json({ msg: "Email already in use" });
		}

		const usernameExists = await User.findOne({
			username: req.body.username,
		});
		if (usernameExists) {
			return res.status(400).json({ msg: "Username already taken" });
		}

		// Tìm role Tenant
		let tenantRole = await Role.findOne({ role_name: "Tenant" });

		// Nếu không tìm thấy role Tenant, tạo mới
		if (!tenantRole) {
			tenantRole = await Role.create({
				role_name: "Tenant",
				permissions: {
					view_rooms: true,
				},
			});
		}

		// Lấy dữ liệu từ request
		const { name, username, email, password, phone, address, age, gender } =
			req.body;

		// Kiểm tra dữ liệu đầu vào
		if (!name || !username || !email || !password) {
			return res.status(400).json({
				msg: "Please provide name, username, email, and password",
			});
		}

		// Tạo người dùng mới với role Tenant
		const newUser = new User({
			name,
			username,
			email,
			password,
			phone,
			address,
			age,
			gender,
			role_id: tenantRole._id,
		});

		// Lưu người dùng
		await newUser.save();

		// Tạo token
		const token = jwt.sign(
			{ id: newUser._id, name: newUser.name },
			process.env.JWT_SECRET,
			{ expiresIn: "30d" }
		);

		// Trả về response
		return res.status(201).json({
			user: {
				id: newUser._id,
				name: newUser.name,
				username: newUser.username,
				email: newUser.email,
				role: "Tenant",
			},
			token,
		});
	} catch (error) {
		console.error("Registration error:", error);
		return res.status(500).json({
			msg: "Server error during registration",
			error: error.message,
		});
	}
};
// Đổi mật khẩu (yêu cầu đăng nhập)
const changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user.id; // Lấy từ authMiddleware

		// Kiểm tra dữ liệu đầu vào
		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				msg: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới",
			});
		}

		// Kiểm tra độ dài mật khẩu mới
		if (newPassword.length < 6) {
			return res.status(400).json({
				msg: "Mật khẩu mới phải có ít nhất 6 ký tự",
			});
		}

		// Tìm người dùng
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ msg: "Không tìm thấy người dùng" });
		}

		// Xác minh mật khẩu hiện tại
		const isMatch = await user.comparePassword(currentPassword);
		if (!isMatch) {
			return res.status(400).json({ msg: "Mật khẩu hiện tại không đúng" });
		}

		// Cập nhật mật khẩu mới
		user.password = newPassword;
		await user.save(); // Middleware pre-save sẽ hash mật khẩu

		return res.status(200).json({ msg: "Đổi mật khẩu thành công" });
	} catch (error) {
		console.error("Change password error:", error);
		return res.status(500).json({
			msg: "Lỗi server khi đổi mật khẩu",
			error: error.message,
		});
	}
};

// Quên mật khẩu - Yêu cầu reset
const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ msg: "Vui lòng cung cấp email" });
		}

		// Tìm người dùng theo email
		const user = await User.findOne({ email });
		if (!user) {
			// Trả về 200 thay vì 404 vì lý do bảo mật (không tiết lộ email tồn tại hay không)
			return res.status(200).json({
				msg: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
			});
		}

		// Tạo token reset password
		const resetToken = crypto.randomBytes(32).toString("hex");

		// Lưu token đã hash vào DB (không lưu token gốc vì lý do bảo mật)
		user.resetPasswordToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		// Token hết hạn sau 10 phút
		user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

		await user.save({ validateBeforeSave: false });

		// Tạo URL reset
		const resetURL = `${req.protocol}://${req.get(
			"host"
		)}/api/auth/reset-password/${resetToken}`;

		// Nội dung email
		const message = `  
      Bạn đã yêu cầu đặt lại mật khẩu.   
      Vui lòng truy cập đường dẫn sau để đặt lại mật khẩu của bạn: ${resetURL}  
      Đường dẫn này sẽ hết hạn sau 10 phút.  
      Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.  
    `;

		// // Sử dụng service để gửi email
		// await sendPasswordResetEmail(user.email, user.name, resetURL);

		// res.status(200).json({
		// 	msg: "Email đặt lại mật khẩu đã được gửi",
		// });
	} catch (error) {
		console.error("Forgot password error:", error);
		return res.status(500).json({
			msg: "Lỗi server khi xử lý yêu cầu quên mật khẩu",
			error: error.message,
		});
	}
};

// Đặt lại mật khẩu sau khi nhận được token
const resetPassword = async (req, res) => {
	try {
		// Lấy token từ params và mật khẩu mới từ body
		const resetToken = req.params.token; // Đổi tên biến từ token thành resetToken
		const { password } = req.body;

		if (!resetToken || !password) {
			return res.status(400).json({
				msg: "Vui lòng cung cấp token và mật khẩu mới",
			});
		}

		// Hash token để tìm trong DB
		const hashedToken = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		// Tìm người dùng có token còn hạn
		const user = await User.findOne({
			resetPasswordToken: hashedToken,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({
				msg: "Token không hợp lệ hoặc đã hết hạn",
			});
		}

		// Kiểm tra độ dài mật khẩu mới
		if (password.length < 6) {
			return res.status(400).json({
				msg: "Mật khẩu mới phải có ít nhất 6 ký tự",
			});
		}

		// Cập nhật mật khẩu mới
		user.password = password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;

		await user.save(); // Middleware pre-save sẽ hash mật khẩu

		// Tạo JWT mới để người dùng có thể đăng nhập ngay
		const token = jwt.sign(
			{ id: user._id, name: user.name },
			process.env.JWT_SECRET,
			{ expiresIn: "30d" }
		);

		// Chuyển đối tượng Mongoose thành plain JavaScript object
		const userObj = user.toObject();
		// Loại bỏ password
		const { password: _, ...userWithoutPassword } = userObj;

		return res.status(200).json({
			msg: "Đặt lại mật khẩu thành công",
			user: userWithoutPassword,
			token,
		});
	} catch (error) {
		console.error("Reset password error:", error);
		return res.status(500).json({
			msg: "Lỗi server khi đặt lại mật khẩu",
			error: error.message,
		});
	}
};

module.exports = {
	login,
	registerOwner,
	registerTenant,
	changePassword,
	forgotPassword,
	resetPassword,
};
