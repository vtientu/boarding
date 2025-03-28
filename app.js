require("dotenv").config();
require("express-async-errors");

const connectDB = require("./db/connect");
const express = require("express");
const cors = require("cors");
const app = express();
const mainRouter = require("./routes/user");
const ownerRouter = require("./routes/ownerRoutes");
const tenantRouter = require("./routes/tenantRoutes");

app.use(express.json());

app.use(cors());
app.use("/user", mainRouter);
app.use("/owner", ownerRouter);
app.use("/tenant", tenantRouter);

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
