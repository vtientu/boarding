const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

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

		if (isMatch) {
			const token = jwt.sign(
				{ id: foundUser._id, name: foundUser.name },
				process.env.JWT_SECRET,
				{
					expiresIn: "30d",
				},
			);

			return res.status(200).json({ msg: "user logged in", token });
		} else {
			return res.status(400).json({ msg: "Bad password" });
		}
	} else {
		return res.status(400).json({ msg: "Bad credentails" });
	}
};

const dashboard = async (req, res) => {
	const luckyNumber = Math.floor(Math.random() * 100);

	res.status(200).json({
		msg: `Hello, ${req.user.name}`,
		secret: `Here is your authorized data, your lucky number is ${luckyNumber}`,
	});
};

const getAllUsers = async (req, res) => {
	let users = await User.find({});

	return res.status(200).json({ users });
};

const register = async (req, res) => {
	try {
		let foundUser = await User.findOne({ email: req.body.email });

		// Kiểm tra nếu email đã tồn tại
		if (foundUser) {
			return res.status(400).json({ msg: "Email already in use" });
		}

		// Tìm role Guest
		const guestRole = await Role.findOne({ role_name: "Guest" });

		// Nếu không tìm thấy role Guest, tạo mới
		if (!guestRole) {
			const newGuestRole = new Role({
				role_name: "Guest",
				permissions: {
					view_rooms: true,
				},
			});
			await newGuestRole.save();
		}

		// Lấy lại role Guest sau khi tạo (nếu vừa tạo)
		const roleGuest = await Role.findOne({ role_name: "Guest" });

		// Kiểm tra dữ liệu đầu vào
		let { name, username, email, password } = req.body;

		if (!username || !email || !password) {
			return res.status(400).json({
				msg: "Please provide username, email, and password",
			});
		}

		// Tạo người dùng mới với role Guest
		const newUser = new User({
			name: name,
			username: username,
			email: email,
			password: password,
			role_id: roleGuest._id, // Gán role Guest
		});

		// Lưu người dùng
		await newUser.save();

		// Tạo token
		const token = jwt.sign(
			{ id: newUser._id, name: newUser.name },
			process.env.JWT_SECRET,
			{ expiresIn: "30d" },
		);

		// Trả về response
		return res.status(201).json({
			user: {
				id: newUser._id,
				name: newUser.name,
				username: newUser.username,
				email: newUser.email,
				role: "Guest",
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

module.exports = {
	login,
	register,
	dashboard,
	getAllUsers,
};
