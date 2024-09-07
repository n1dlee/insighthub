const { getLatestNews } = require("../models/news.model");

const fetchNews = async (req, res) => {
  try {
    const newsArticles = await getLatestNews();
    res.json({ articles: newsArticles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { fetchNews };
