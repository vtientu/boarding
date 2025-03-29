const nodemailer = require("nodemailer");
require("dotenv").config();

// Tạo transporter với cấu hình từ biến môi trường
let transporter = null;

/**
 * Khởi tạo transporter cho email service
 */
const initTransporter = () => {
	// Sử dụng cấu hình từ file .env
	const emailConfig = {
		host: process.env.EMAIL_HOST || "smtp.gmail.com",
		port: process.env.EMAIL_PORT || 587,
		secure: process.env.EMAIL_SECURE === "true", // true cho SSL 465, false cho các cổng khác
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
		tls: {
			rejectUnauthorized: process.env.NODE_ENV === "production", // chỉ validate SSL trong production
		},
	};

	// Tạo transporter với cấu hình
	transporter = nodemailer.createTransport(emailConfig);

	// Xác minh kết nối
	transporter.verify((error) => {
		if (error) {
			console.error("Email service error:", error);
		} else {
			console.log("Email service is ready to send messages");
		}
	});
};

/**
 * Gửi email
 * @param {Object} options - Các tùy chọn email
 * @param {String} options.to - Người nhận (có thể là nhiều người, ngăn cách bằng dấu phẩy)
 * @param {String} options.subject - Tiêu đề email
 * @param {String} options.text - Nội dung dạng text
 * @param {String} options.html - Nội dung dạng HTML
 * @param {String} options.from - Người gửi (nếu không cung cấp, sẽ sử dụng giá trị mặc định)
 * @param {String} options.cc - CC (người nhận carbon copy)
 * @param {String} options.bcc - BCC (người nhận blind carbon copy)
 * @param {Array} options.attachments - Danh sách tệp đính kèm
 * @returns {Promise} - Promise chứa kết quả gửi email
 */
const sendEmail = async (options) => {
	// Khởi tạo transporter nếu chưa được khởi tạo
	if (!transporter) {
		initTransporter();
	}

	// Cấu hình mặc định cho email
	const defaultFrom = `${process.env.EMAIL_FROM_NAME || "Boarding House System"
		} <${process.env.EMAIL_USERNAME}>`;

	// Cấu hình email để gửi
	const mailOptions = {
		from: options.from || defaultFrom,
		to: options.to,
		subject: options.subject,
		text: options.text,
		html: options.html,
		cc: options.cc,
		bcc: options.bcc,
		attachments: options.attachments,
	};

	try {
		// Gửi email và trả về kết quả
		const info = await transporter.sendMail(mailOptions);
		console.log(`Email sent: ${info.messageId}`);
		return info;
	} catch (error) {
		console.error("Error sending email:", error);
		throw error;
	}
};

/**
 * Gửi email khôi phục mật khẩu
 * @param {String} to - Email người nhận
 * @param {String} name - Tên người nhận
 * @param {String} resetUrl - URL khôi phục mật khẩu
 * @returns {Promise} - Promise chứa kết quả gửi email
 */
const sendPasswordResetEmail = async (to, name, resetUrl) => {
	const subject = "Đặt lại mật khẩu của bạn";

	// Nội dung text
	const text = `  
    Xin chào ${name},  
    
    Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:  
    
    ${resetUrl}  
    
    Liên kết này sẽ hết hạn sau 10 phút.  
    
    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.  
    
    Trân trọng,  
    Đội ngũ Boarding House System  
  `;

	// Nội dung HTML
	const html = `  
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">  
      <h2 style="color: #333; text-align: center;">Đặt lại mật khẩu</h2>  
      <p>Xin chào <strong>${name}</strong>,</p>  
      <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng nhấp vào nút dưới đây để đặt lại mật khẩu:</p>  
      <div style="text-align: center; margin: 30px 0;">  
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Đặt lại mật khẩu</a>  
      </div>  
      <p>Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:</p>  
      <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">  
        ${resetUrl}  
      </p>  
      <p>Liên kết này sẽ hết hạn sau <strong>10 phút</strong>.</p>  
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>  
      <p>Trân trọng,<br>Đội ngũ Boarding House System</p>  
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9e9e9; font-size: 12px; color: #777; text-align: center;">  
        Email này được gửi tự động, vui lòng không trả lời.  
      </div>  
    </div>  
  `;

	return sendEmail({
		to,
		subject,
		text,
		html,
	});
};

/**
 * Gửi email chào mừng
 * @param {String} to - Email người nhận
 * @param {String} name - Tên người nhận
 * @param {String} role - Vai trò người dùng (Owner/Tenant)
 * @returns {Promise} - Promise chứa kết quả gửi email
 */
const sendWelcomeEmail = async (to, name, role) => {
	const subject = "Chào mừng bạn đến với Boarding House System";

	const roleText = role === "Owner" ? "chủ trọ" : "người thuê trọ";

	// Nội dung text
	const text = `  
    Xin chào ${name},  
    
    Chúc mừng bạn đã đăng ký thành công tài khoản ${roleText} tại Boarding House System.  
    
    Chúng tôi rất vui mừng được chào đón bạn vào hệ thống của chúng tôi!  
    
    Trân trọng,  
    Đội ngũ Boarding House System  
  `;

	// Nội dung HTML
	const html = `  
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">  
      <h2 style="color: #333; text-align: center;">Chào mừng đến với Boarding House System!</h2>  
      <p>Xin chào <strong>${name}</strong>,</p>  
      <p>Chúc mừng bạn đã đăng ký thành công tài khoản <strong>${roleText}</strong> tại Boarding House System.</p>  
      <p>Chúng tôi rất vui mừng được chào đón bạn vào hệ thống của chúng tôi!</p>  
      <p>Trân trọng,<br>Đội ngũ Boarding House System</p>  
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9e9e9; font-size: 12px; color: #777; text-align: center;">  
        Email này được gửi tự động, vui lòng không trả lời.  
      </div>  
    </div>  
  `;

	return sendEmail({
		to,
		subject,
		text,
		html,
	});
};

module.exports = {
	initTransporter,
	sendEmail,
	sendPasswordResetEmail,
	sendWelcomeEmail,
};
