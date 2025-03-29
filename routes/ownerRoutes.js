const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware(["Owner"]));

// Room Management
router.get("/rooms", ownerController.manageRooms); // done

// Tenant Management - done
router.post("/tenants", ownerController.manageTenants); // done
router.delete("/tenants/:id", ownerController.manageTenants); // done

// Bill Management
router.get("/bills", ownerController.getBills); // OKE
router.post("/bills/create", ownerController.createBill); // OKE
router.put("/bills/:id", ownerController.updateBill); // OKE

// Reports
router.get("/reports", ownerController.generateReports); // OKE

module.exports = router;
