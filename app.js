require("dotenv").config();
require("express-async-errors");
const connectDB = require("./db/connect");
const express = require("express");
const cors = require("cors");
const http = require("http"); // Import HTTP module
const { initTransporter } = require("./utils/emailService");
const { initializeSocket } = require("./config/socketConfig");

const app = express();
const server = http.createServer(app); // Tạo HTTP server
const port = process.env.PORT || 3000;

// Kết nối DB
connectDB();

// Khởi tạo transporter cho email
initTransporter();

app.use(express.json());
app.use(cors());

// Import routes
const mainRouter = require("./routes/user");
const ownerRouter = require("./routes/ownerRoutes");
const tenantRouter = require("./routes/tenantRoutes");
const boardingHouseRoutes = require("./routes/boardingHouseRoutes");
const roomRoutes = require("./routes/roomRoutes");
const chatRoutes = require("./routes/chat");
const paymentRoutes = require("./routes/paymentRoutes");

// Định nghĩa API routes
app.use("/users", mainRouter);
app.use("/owners", ownerRouter);
app.use("/tenants", tenantRouter);
app.use("/boardinghouses", boardingHouseRoutes);
app.use("/rooms", roomRoutes);
app.use("/chat", chatRoutes);
app.use("/api/payments", paymentRoutes);

// Khởi tạo WebSocket
initializeSocket(server);

// Lắng nghe server
server.listen(port, () => {
	console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});

// Xử lý lỗi khi khởi động server
server.on("error", (err) => {
	if (err.code === "EADDRINUSE") {
		console.error(`Cổng ${port} đã bị chiếm!`);
	} else {
		console.error(`🔥 Lỗi server: ${JSON.stringify(err, null, 2)}`);
	}

	process.on("beforeExit", () => {
		process.exit(1);
	});
});
