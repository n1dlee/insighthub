const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Investor = require("../models/investor.model");
const WorkHistory = require("../models/workHistory.model");
const WorkExperience = require("../models/workExperience.model");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const generateJwt = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_TOKEN, { expiresIn: "24h" });
};

// Настройка хранилища для загрузки изображений профиля
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const token = req.cookies.authToken;
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    const userId = decoded.id;
    const uploadDir = `assets/uploads/investor/${userId}`;
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `image.png`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB limit
  },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return cb(new Error("Only images are allowed"), false);
    }
    cb(null, true);
  },
});

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
        location,
        companyName,
        jobFunc,
      } = req.body;

      const requiredFields = [
        "name",
        "surname",
        "age",
        "email",
        "password",
        "location",
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

      const hashPassword = await bcrypt.hash(password, 5);

      const newInvestor = await Investor.create({
        name,
        surname,
        age,
        middle,
        email,
        password: hashPassword,
        livesOutsideUS,
        location,
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
        secure: process.env.NODE_ENV === "production",
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

  async getInvestors(req, res) {
    try {
      const investors = await Investor.findAll();
      res.json(investors);
    } catch (error) {
      next(ApiError.internal("Error fetching investors"));
    }
  }

  async getOneInvestor(req, res, next) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) {
        return next(ApiError.badRequest("Invalid investor ID"));
      }
      const investor = await Investor.findByPk(id);

      if (!investor) {
        return next(ApiError.notFound("Investor not found"));
      }
      res.json(investor);
    } catch (error) {
      console.error("Error fetching investor:", error);
      next(ApiError.internal("Error fetching investor"));
    }
  }

  async updateInvestor(req, res, next) {
    try {
      const { id } = req.params;
      const {
        profile_image,
        location,
        companyName,
        jobFunc,
        bio,
        workExperience,
        workHistory,
      } = req.body;

      // Validate user ID
      if (!id || isNaN(id)) {
        return next(ApiError.badRequest("Invalid investor ID"));
      }

      // Fetch investor from database
      const investor = await Investor.findByPk(id);
      if (!investor) {
        return next(ApiError.notFound("Investor not found"));
      }

      // Update investor data only if the field has been changed
      if (profile_image) investor.profile_image = profile_image;
      if (location) investor.location = location;
      if (location) investor.location = location;
      if (companyName) investor.companyName = companyName;
      if (jobFunc) investor.jobFunc = jobFunc;
      if (bio) investor.bio = bio;

      // Update work experience and work history
      if (workExperience) investor.workExperience = workExperience;
      if (workHistory) investor.workHistory = workHistory;

      // Save changes to database
      await investor.save();

      // Return success response
      res.json(investor);
    } catch (error) {
      // Handle errors
      console.error("Error updating investor:", error);
      next(ApiError.internal("Error updating investor", error));
    }
  }

  async uploadProfileImage(req, res, next) {
    upload.single("profileImage")(req, res, async (err) => {
      if (err) {
        if (
          err instanceof multer.MulterError &&
          err.code === "LIMIT_FILE_SIZE"
        ) {
          return next(ApiError.badRequest("File size exceeds 3MB limit"));
        } else {
          return next(ApiError.badRequest(err.message));
        }
      }

      try {
        const profileImage = req.file;

        if (!profileImage) {
          return next(ApiError.badRequest("No image uploaded"));
        }

        const token = req.cookies.authToken;
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
        const userId = decodedToken.id;

        const investor = await Investor.findByPk(userId);
        if (!investor) {
          return next(ApiError.notFound("Investor not found"));
        }

        investor.profile_image = profileImage.filename;
        await investor.save();

        res.json({
          message: "Image uploaded successfully",
          filename: profileImage.filename,
        });
      } catch (error) {
        next(ApiError.internal("Error uploading image"));
      }
    });
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

  async deleteInvestor(req, res, next) {
    try {
      const id = req.params.id;
      const investor = await Investor.findByPk(id);
      if (investor) {
        await investor.destroy();
        res.json({ message: "Investor deleted successfully" });
      } else {
        return next(ApiError.notFound("Investor not found"));
      }
    } catch (error) {
      console.error("Error deleting investor:", error);
      next(ApiError.internal("Error deleting investor"));
    }
  }
}

module.exports = new investorController();
