const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const sequelize = require("./db");
const errorHandler = require("./assets/middleware/ErrorHandlingMiddleware");

const userRouter = require("./assets/routes/user.routes");
const investorPostRouter = require("./assets/routes/investor-post.routes");
const studentPostRouter = require("./assets/routes/student-post.routes");
const investorRouter = require("./assets/routes/investor.routes");
const newsRouter = require("./assets/routes/news.router");

const PORT = process.env.PORT || 8080;
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS Headers Middleware (Adjust as needed for your development/production setup)
app.use(
  cors({
    origin: true, // Allow any origin in development (not secure for production)
    credentials: true,
  })
);

// CORS Headers Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes
app.use("/api", userRouter);
app.use("/api", investorPostRouter);
app.use("/api", studentPostRouter);
app.use("/api", investorRouter);

// Mount the news router
app.use("/api", newsRouter);

// Asset Route
app.use("/assets", express.static(path.join(__dirname, "assets")));

/*Middleware должен идти в конце, все обновления выше*/
app.use(errorHandler);

//Mapping done by @shiroyash_a

// Home page
app.get(["/", "/home", "/index"], (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get(["/main"], (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

app.get(["/investor-main"], (req, res) => {
  res.sendFile(path.join(__dirname, "investor-main.html"));
});

app.get(["/discover"], (req, res) => {
  res.sendFile(path.join(__dirname, "discover.html"));
});

// Register page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});

// Registration page for investors
app.get("/register-investor", (req, res) => {
  res.sendFile(path.join(__dirname, "register-investor.html"));
});

// Registration page for students
app.get("/register-student", (req, res) => {
  res.sendFile(path.join(__dirname, "register-student.html"));
});

// Login Page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// Login page for investors
app.get("/login-investor", (req, res) => {
  res.sendFile(path.join(__dirname, "login-investor.html"));
});

// Login page for students
app.get("/login-student", (req, res) => {
  res.sendFile(path.join(__dirname, "login-student.html"));
});

// Profile page
app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "profile.html"));
});

app.get("/profile-change", (req, res) => {
  res.sendFile(path.join(__dirname, "profile-change.html"));
});

app.get("/investor-profile-change", (req, res) => {
  res.sendFile(path.join(__dirname, "investor-profile-change.html"));
});

app.get("/investor-profile", (req, res) => {
  res.sendFile(path.join(__dirname, "investor-profile.html"));
});

// Legal terms
app.get("/legal-terms", (req, res) => {
  res.sendFile(path.join(__dirname, "legal-terms.html"));
});

// Register route
app.post("/register", (req, res) => {
  const user = req.body;
  addUser(user, () => {
    res.send("User added successfully");
  });
});

// Sync models and start the server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced");
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Unable to sync the database:", error);
  });
