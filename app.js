require("dotenv").config();
require("express-async-errors");
const http = require("http");

const connectDB = require("./db/connect");
const express = require("express");
const cors = require("cors");
const app = express();
const { initTransporter } = require("./utils/emailService");
const { initializeSocket } = require("./config/socketConfig");

const mainRouter = require("./routes/user");
const ownerRouter = require("./routes/ownerRoutes");
const tenantRouter = require("./routes/tenantRoutes");
const boardingHouseRoutes = require("./routes/boardingHouseRoutes");
const roomRoutes = require("./routes/roomRoutes");
const chatRoutes = require("./routes/chat");
const paymentRoutes = require("./routes/paymentRoutes");

app.use(express.json());

app.use(cors());
// initTransporter();

app.use("/users", mainRouter);
app.use("/owners", ownerRouter);
app.use("/tenants", tenantRouter);
app.use("/boardinghouses", boardingHouseRoutes);
app.use("/rooms", roomRoutes);
// app.use("/chat", chatRoutes);
// app.use('/api/payments', paymentRoutes);

// // Tạo HTTP server
// const server = http.createServer(app);

// // Khởi tạo Socket.IO
// const io = initializeSocket(server);

const port = process.env.PORT || 3000;

const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI);
		app.listen(port, () => {
			console.log(`Server is listening on port ${port}`);
		});
	} catch (error) {
		console.log(error);
	}
};

start();
