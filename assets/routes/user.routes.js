const express = require("express");
const userController = require("../controller/user.controller");
// const userController = require('./controllers/user');
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
// const router = express()

// User routes
router.post("/user", userController.createUser);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/auth-student", authMiddleware, userController.check);
router.get("/users", authMiddleware, userController.getUsers);
router.get("/user/:id", authMiddleware, userController.getOneUser);
router.put("/user/:id", userController.updateUser);

router.delete("/user/:id", authMiddleware, userController.deleteUser);
router.get("/universities", userController.getUniversities);
router.get("/majors", userController.getMajors);

module.exports = router;
