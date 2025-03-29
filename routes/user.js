const express = require("express");
const router = express.Router();

const {
	login,
	registerOwner,
	registerTenant,
	changePassword,
	forgotPassword,
	resetPassword,
	getUserById,
	getUserList,
} = require("../controllers/user");
const authMiddleware = require("../middleware/auth");

router.route("/login").post(login); // done
router.route("/register_owner").post(registerOwner); // done
router.route("/register_tenant").post(registerTenant); // done
router.route("/change-password").post(authMiddleware, changePassword); // done
router.route("/forgot-password").post(forgotPassword); // OKE
router.route("/reset-password/:token").post(resetPassword); // OKE
router.get("/:userId", authMiddleware, getUserById);
router.get("/", authMiddleware, getUserList);

module.exports = router;
