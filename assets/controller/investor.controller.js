const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Investor = require("../models/investor.model");
require("dotenv").config();

const generateJwt = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_TOKEN, { expiresIn: "24h" });
};

class investorController {
  async createInvestor(req, res, next) {
    try {
      const {
        name,
        surname,
        age,
        middle,
        email,
        password,
        livesOutsideUS,
        workPlace,
        companyName,
        jobFunc,
      } = req.body;

      const requiredFields = [
        "name",
        "surname",
        "age",
        "email",
        "password",
        "workPlace",
        "jobFunc",
      ];

      for (const field of requiredFields) {
        if (!req.body[field]) {
          return next(ApiError.badRequest(`Missing required field: ${field}`));
        }
      }

      const candidate = await Investor.findOne({ where: { email } });
      if (candidate) {
        return next(
          ApiError.badRequest("An investor with this email already exists")
        );
      }

      const hashPassword = await bcrypt.hash(password, 5); // Use a reasonable number of salt rounds (e.g., 10-12)

      const newInvestor = await Investor.create({
        name,
        surname,
        age,
        middle,
        email,
        password: hashPassword,
        livesOutsideUS,
        workPlace,
        companyName,
        jobFunc,
      });

      const { password: _, ...investorWithoutPassword } =
        newInvestor.dataValues;
      res.json(investorWithoutPassword);
    } catch (error) {
      console.error("Error creating investor:", error);
      next(ApiError.internal("Error creating investor"));
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(ApiError.badRequest("Email and password are required"));
      }

      const investor = await Investor.findOne({ where: { email } });
      if (!investor) {
        return next(ApiError.notFound("Investor not found"));
      }

      const isPasswordValid = await bcrypt.compare(password, investor.password);
      if (!isPasswordValid) {
        return next(ApiError.unauthorized("Invalid credentials"));
      }

      const token = generateJwt(investor.id, investor.email);

      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production, not in development
        sameSite: "Strict",
      });

      res.json({ id: investor.id, message: "Login successful" });
    } catch (error) {
      console.error("Error during login:", error);
      next(ApiError.internal("Error during login"));
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Error during logout:", error);
      next(ApiError.internal("Error during logout"));
    }
  }

  async check(req, res, next) {
    try {
      const user = req.user; // Assuming your authMiddleware sets req.user
      if (!user || !user.id || !user.email) {
        return next(ApiError.internal("Error during check: Missing user data"));
      }

      // If you need to fetch additional investor data, add a query here
      // const additionalInvestorData = await Investor.findByPk(user.id);

      res.json({
        id: user.id,
        email: user.email,
        // ... other investor data from additionalInvestorData (if fetched)
      });
    } catch (error) {
      next(ApiError.internal("Error during check"));
    }
  }

  async getInvestors(req, res) {
    try {
      const users = await Investor.findAll();
      res.json(users);
    } catch (error) {
      next(ApiError.internal("Error fetching users"));
    }
  }

  async getOneInvestor(req, res, next) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) {
        return next(ApiError.badRequest("Invalid user ID"));
      }
      const user = await Investor.findByPk(id);

      if (!user) {
        return next(ApiError.notFound("User not found")); // Use a more specific 404 error
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error); // Log the error for debugging
      next(ApiError.internal("чел ты долбаеб"));
    }
  }

  async updateInvestor(req, res, next) {
    try {
      const {
        id,
        name,
        surname,
        age,
        middle,
        email,
        livesOutsideUS,
        workPlace,
        jobFunc,
      } = req.body;

      const user = await Investor.findByPk(id);
      if (user) {
        await user.update({
          name,
          surname,
          age,
          middle,
          email,
          livesOutsideUS,
          workPlace,
          jobFunc,
        });
        res.json(user);
      } else {
        next(ApiError.badRequest("Investor not found"));
      }
    } catch (error) {
      next(ApiError.internal("Error updating Investor"));
    }
  }

  async deleteInvestor(req, res) {
    try {
      const id = req.params.id;
      const user = await Investor.findByPk(id);
      if (user) {
        await user.destroy();
        res.json({ message: "Investor deleted successfully" });
      } else {
        next(ApiError.badRequest("Investor not found"));
      }
    } catch (error) {
      next(ApiError.internal("Error deleting investor"));
    }
  }
}

module.exports = new investorController();
