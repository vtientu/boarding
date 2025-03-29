const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware(["Tenant"]));

router.patch("/profile", tenantController.updateTenantProfile);
router.get("/profile", tenantController.getTenantProfile);
router.get("/contracts", tenantController.getTenantContracts);
router.get("/payment-history", tenantController.getTenantPaymentHistory);

module.exports = router;
