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
      res.json(majors);
    } catch (error) {
      console.error("Error fetching majors:", error);
      next(ApiError.internal("Error fetching majors"));
    }
  }

  async updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const { profile_image, location, major, gpa, sat, ielts, achievements, bio } = req.body;

        console.log("Request body:", req.body); // Log the request body
        console.log("Request params:", req.params); // Log the request params

        // Validate the ID
        if (!id || isNaN(id)) {
            return next(ApiError.badRequest("Invalid user ID"));
        }

        // Fetch the user from the database
        const user = await Student.findByPk(id);
        if (!user) {
            return next(ApiError.notFound("User not found"));
        }

        // Prepare the fields to be updated
        const updateData = {};
        if (profile_image !== undefined) updateData.profile_image = profile_image;
        if (location !== undefined) updateData.location = location;
        if (major !== undefined) updateData.major = major;
        if (gpa !== undefined) updateData.gpa = gpa;
        if (sat !== undefined) updateData.sat = sat;
        if (bio !== undefined) updateData.bio = bio;
        if (ielts !== undefined) updateData.ielts = ielts;
        if (achievements !== undefined) updateData.achievements = achievements;

        // Log the prepared update data
        console.log("Updating user with data:", updateData);

        // Update the user with the new data
        await user.update(updateData);

        // Log confirmation
        console.log(`User with ID ${id} updated successfully`);

        // Send the updated user data as the response
        res.json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        next(ApiError.internal("Error updating user"));
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
