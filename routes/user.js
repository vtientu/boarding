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
  activeUser,
  inactiveUser,
  getTenantCombo,
  updateUser,
  updateUserManager,
} = require("../controllers/user");
const authMiddleware = require("../middleware/auth");

router.route("/login").post(login); // done
router.route("/register_owner").post(registerOwner); // done
router.route("/register_tenant").post(registerTenant); // done
router.route("/change-password").post(authMiddleware, changePassword); // done
router.route("/forgot-password").post(forgotPassword); // OKE
router.route("/reset-password").post(resetPassword); // OKE
router.get("/:userId", authMiddleware, getUserById); // OKE
router.get("/", authMiddleware, getUserList); // OKE
router.put("/:userId", authMiddleware, updateUserManager);
router.get("/tenant/combo", authMiddleware, getTenantCombo);
router.patch("/active/:userId", authMiddleware, activeUser); // OKE
router.patch("/inactive/:userId", authMiddleware, inactiveUser); // OKE
router.put("/profile", authMiddleware, updateUser);

module.exports = router;
