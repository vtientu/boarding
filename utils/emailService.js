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
  const defaultFrom = `${
    process.env.EMAIL_FROM_NAME || "Boarding House System"
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
const sendPasswordResetEmail = async (to, name, resetCode) => {
  const subject = "Đặt lại mật khẩu của bạn";

  // Nội dung text
  const text = `  
    Xin chào ${name},  
    
    Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:  
    
    ${resetCode}  
    
    Code này sẽ hết hạn sau 10 phút.  
    
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
        <p style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">${resetCode}</p>  
      </div>  
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

/**
 * Gửi email thông báo đóng tiền hóa đơn
 * @param {String} to - Email người nhận
 * @param {String} name - Tên người nhận
 * @param {String} subject - Tiêu đề email
 * @param {String} message - Nội dung email
 * @returns {Promise} - Promise chứa kết quả gửi email
 */
const sendNotificationEmail = async (to, message, tenant) => {
  const total_amount =
    tenant.room_id?.room_price +
    tenant.room_id?.electricity +
    tenant.room_id?.water +
    tenant.room_id?.additional_services;
  const payment_deadline = tenant.room_id?.payment_deadline;
  const payment_link = process.env.FRONTEND_URL + "/payments";

  const html = `<div style="max-width: 600px; margin: 20px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #2c3e50; text-align: center;">🏠 Thông Báo Đóng Tiền Trọ</h2>
        <p>Xin chào <b>${tenant.name}</b>,</p>
        <p>${message}</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Phòng:</b></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${tenant.room_id?.room_number}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Giá Phòng:</b></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${tenant.room_id?.room_price} VND</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Điện:</b></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${tenant.room_id?.electricity} VND</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Nước:</b></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${tenant.room_id.water} VND</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Dịch vụ khác:</b></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${tenant.room_id.additional_services} VND</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Tổng cộng:</b></td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: red;">${total_amount} VND</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Hạn thanh toán:</b></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${payment_deadline}</td>
            </tr>
        </table>

        <p style="margin-top: 20px;">Vui lòng thanh toán trước hạn để tránh phát sinh phí trễ hạn. Nếu đã thanh toán, vui lòng bỏ qua email này.</p>
		<div>
		<h3 style="text-align: center;font-weight: bold;font-size: 20px;">Thông tin thanh toán<h3>
	        <p style="text-align: center; margin-top: 20px;">
	            Ngân hàng: TECHCOMBANK
	        </p>
	        <p style="text-align: center;">
	            STK: 19036678206011
	        </p>
	        <p style="text-align: center;">
	            Chủ tài khoản: VUONG VAN GIANG
	        </p>
		</div>

        <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">Mọi thắc mắc vui lòng liên hệ chủ trọ. Cảm ơn bạn đã sử dụng dịch vụ!</p>
    </div>`;

  const subject = "Thông báo đóng tiền hóa đơn";
  const text = `Xin chào ${tenant.name},
	${message}
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
  sendNotificationEmail,
};
