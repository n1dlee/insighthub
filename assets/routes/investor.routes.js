const express = require("express");
const investorController = require("../controller/investor.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Investor routes
router.post("/investor", investorController.createInvestor);
router.post("/investor-login", investorController.login);
router.post("/logout", investorController.logout);
router.post(
  "/investor/:id/upload-profile-image",
  investorController.uploadProfileImage
);
router.get("/auth-investor", authMiddleware, investorController.check);
router.get("/investors", authMiddleware, investorController.getInvestors);
router.get("/investor/:id", authMiddleware, investorController.getOneInvestor);
router.put("/investor/:id", authMiddleware, investorController.updateInvestor);
router.delete(
  "/investor/:id",
  authMiddleware,
  investorController.deleteInvestor
);
router.get("/universities", investorController.getUniversities);
router.get("/majors", investorController.getMajors);

module.exports = router;
