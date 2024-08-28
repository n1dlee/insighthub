const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Student = require("../models/student.model"); // Your Student model
const University = require("../models/university.model");
const Major = require("../models/major.model");
require("dotenv").config();

const generateJwt = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_TOKEN, { expiresIn: "24h" });
};

class UserController {
  async createUser(req, res, next) {
    try {
      const {
        name,
        surname,
        age,
        middle,
        email,
        password,
        livesOutsideUS,
        educationPlace,
        primaryDegree,
      } = req.body;

      const requiredFields = [
        "name",
        "surname",
        "age",
        "email",
        "password",
        "educationPlace",
        "primaryDegree",
      ];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return next(ApiError.badRequest(`Missing required field: ${field}`));
        }
      }

      const candidate = await Student.findOne({ where: { email } });
      if (candidate) {
        return next(
          ApiError.badRequest("A user with this email already exists")
        );
      }

      const hashPassword = await bcrypt.hash(password, 5);

      const newPerson = await Student.create({
        name,
        surname,
        age,
        middle,
        email,
        password: hashPassword,
        livesOutsideUS,
        educationPlace,
        primaryDegree,
      });

      const { password: _, ...studentWithoutPassword } = newPerson.dataValues;
      res.json(studentWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      next(ApiError.internal("Error creating user"));
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(ApiError.badRequest("Email and password are required"));
      }

      const user = await Student.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.notFound("User not found"));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return next(ApiError.unauthorized("Invalid credentials"));
      }

      const token = generateJwt(user.id, user.email);

      res.cookie("authToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });

      res.json({ id: user.id, message: "Login successful" });
    } catch (error) {
      console.error("Error during login:", error);
      next(ApiError.internal("Error during login"));
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: true,
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
      const user = req.user;
      if (!user || !user.id || !user.email) {
        return next(ApiError.internal("Error during check: Missing user data"));
      }
      res.json({
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      next(ApiError.internal("Error during check"));
    }
  }

  async getUsers(req, res) {
    try {
      const users = await Student.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching students:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching students" });
    }
  }

  async getOneUser(req, res, next) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) {
        return next(ApiError.badRequest("Invalid user ID"));
      }

      const user = await Student.findByPk(id);

      if (!user) {
        return next(ApiError.notFound("User not found"));
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      next(ApiError.internal("Error fetching user"));
    }
  }
  async getUniversities(req, res, next) {
    try {
      const universities = await University.findAll();
      res.json(universities);
    } catch (error) {
      console.error("Error fetching universities:", error);
      next(ApiError.internal("Error fetching universities"));
    }
  }

  async getMajors(req, res, next) {
    try {
      const majors = await Major.findAll();

      if (majors.length === 0) {
        return res.status(404).json({ message: "No majors found" });
      }

      res.json(majors);
    } catch (error) {
      console.error("Error fetching majors:", error);
      next(ApiError.internal("An error occurred while fetching majors"));
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const {
        profile_image,
        location,
        major,
        gpa,
        sat,
        ielts,
        achievements,
        bio,
      } = req.body;

      // Validate user ID
      if (!id || isNaN(id)) {
        return next(ApiError.badRequest("Invalid user ID"));
      }

      // Fetch user from database
      const user = await Student.findByPk(id);
      if (!user) {
        return next(ApiError.notFound("User not found"));
      }

      // Update user data only if the field has been changed
      if (profile_image) user.profile_image = profile_image;
      if (location) user.location = location;
      if (major) user.major = major;
      if (gpa) user.gpa = gpa;
      if (sat) user.sat = sat;
      if (ielts) user.ielts = ielts;
      if (achievements) user.achievements = achievements;
      if (bio) user.bio = bio;

      // Save changes to database
      await user.save();

      // Return success response
      res.json(user);
    } catch (error) {
      // Handle errors
      console.error("Error updating user:", error);
      next(ApiError.internal("Error updating user", error));
    }
  }

  async deleteUser(req, res, next) {
    try {
      const id = req.params.id;
      const user = await Student.findByPk(id);
      if (user) {
        await user.destroy();
        res.json({ message: "User deleted successfully" });
      } else {
        next(ApiError.badRequest("User not found"));
      }
    } catch (error) {
      next(ApiError.internal("Error deleting user"));
    }
  }
}

module.exports = new UserController();
