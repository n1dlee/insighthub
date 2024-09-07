// /routes/newsRouter.js
const express = require("express");
const { fetchNews } = require("../controller/news.controller");

const router = express.Router();

// Define the route to get news
router.get("/news", fetchNews);

module.exports = router;
