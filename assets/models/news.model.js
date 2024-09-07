const fetch = require("node-fetch");

// Function to get the latest news
const getLatestNews = async () => {
  const apiKey = process.env.NEWS_API_KEY; // API Key from .env file
  const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Error fetching news from the API");
    }
    const data = await response.json();
    return data.articles;
  } catch (error) {
    throw new Error(`News Model Error: ${error.message}`);
  }
};

module.exports = { getLatestNews };
