require("dotenv").config();
require("express-async-errors");

const connectDB = require("./db/connect");
const express = require("express");
const cors = require("cors");
const app = express();
const { initTransporter } = require("./utils/emailService");

const mainRouter = require("./routes/user");
const ownerRouter = require("./routes/ownerRoutes");
const tenantRouter = require("./routes/tenantRoutes");
const boardingHouseRoutes = require("./routes/boardingHouseRoutes");
const roomRoutes = require("./routes/roomRoutes");

app.use(express.json());

app.use(cors());
initTransporter();

app.use("/users", mainRouter);
app.use("/owners", ownerRouter);
app.use("/tenants", tenantRouter);
app.use("/boardinghouses", boardingHouseRoutes);
app.use("/rooms", roomRoutes);

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
