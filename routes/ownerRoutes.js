const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware(["Owner"]));

// Room Management
router.get("/rooms", ownerController.manageRooms); // done

// Dashboard
router.get("/dashboard", ownerController.getDashboard); // OKE

// Tenant Management - done
router.post("/tenants", ownerController.manageTenants); // done
router.get("/tenants/:id", ownerController.manageTenants); // done
router.delete("/tenants/:id", ownerController.manageTenants); // done

// User Management
router.delete("/users/:userId", ownerController.deleteUser); // Thêm route xóa user

// Bill Management
router.get("/bills", ownerController.getBills); // OKE
router.post("/bills/send-notification", ownerController.sendNotification); // OKE
router.post("/bills/create", ownerController.createBill); // OKE
router.put("/bills/:id", ownerController.updateBill); // OKE

// Revenue Statistics
router.get(
  "/revenue-statistics/:year",
  ownerController.getRevenueStatisticsForYear
); // OKE

// Reports
router.get("/reports", ownerController.generateReports); // OKE

module.exports = router;
