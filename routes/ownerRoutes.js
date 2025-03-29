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
router.get("/bills", ownerController.manageBills);
router.post("/bills", ownerController.manageBills);
router.put("/bills/:id", ownerController.manageBills);

// Reports
router.get("/reports", ownerController.generateReports);

module.exports = router;
