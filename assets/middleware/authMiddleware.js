const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: "Authorization required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      console.error("Error in authMiddleware:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
