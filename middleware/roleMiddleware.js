const Role = require("../models/Role");
const User = require("../models/User");

module.exports = (allowedRoles) => {
	return async (req, res, next) => {
		try {
			const user = await User.findById(req.user.id).populate("role_id");

			if (!user || !user.role_id) {
				return res.status(403).json({ message: "User role not found" });
			}

			if (!allowedRoles.includes(user.role_id.role_name)) {
				return res.status(403).json({ message: "Access denied" });
			}

			next();
		} catch (error) {
			res.status(500).json({ message: "Server error", error: error.message });
		}
	};
};
