const express = require("express");
const router = express.Router();

const {
	login,
	registerOwner,
	registerTenant,
	changePassword,
	forgotPassword,
	resetPassword,
} = require("../controllers/user");
const authMiddleware = require("../middleware/auth");

router.route("/login").post(login);
router.route("/register_owner").post(registerOwner);
router.route("/register_tenant").post(registerTenant);
router.route("/change-password").post(authMiddleware, changePassword);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

module.exports = router;
