const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware(["Tenant"]));

router.patch("/profile", tenantController.updateTenantProfile); // done
router.get("/profile", tenantController.getTenantProfile); // done
router.get("/contracts", tenantController.getTenantContracts); // done
router.get("/payment-history", tenantController.getTenantPaymentHistory);
router.get("/bills", tenantController.getTenantBills);

module.exports = router;
