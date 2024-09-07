document.addEventListener("DOMContentLoaded", async () => {
  const newsContainer = document.getElementById("news-articles");
  const loadingIndicator = document.getElementById("loading-indicator");

  loadingIndicator.style.display = "block"; // Show loading

  try {
    const response = await fetch("/api/news"); // Fetch from the local Express server
    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await response.json();
    loadingIndicator.style.display = "none"; // Hide loading

    if (data.articles && data.articles.length > 0) {
      data.articles.forEach((article) => {
        const articleDiv = document.createElement("div");
        articleDiv.classList.add("news-article");

        const title = article.title || "No title available";
        const description = article.description || "No description available";
        const url = article.url || "#";
        const imageUrl = article.urlToImage || "default-image.jpg";

        articleDiv.innerHTML = `
            <img src="${imageUrl}" alt="${title}" class="news-image">
            <h3>${title}</h3>
            <p>${description}</p>
            <a href="${url}" target="_blank" class="read-more">Read more</a>
          `;

        newsContainer.appendChild(articleDiv);
      });
    } else {
      newsContainer.innerHTML = "<p>No news available at the moment.</p>";
    }
  } catch (error) {
    loadingIndicator.style.display = "none";
    newsContainer.innerHTML = `<p>Error loading news: ${error.message}</p>`;
  }
});
