document.addEventListener("DOMContentLoaded", () => {
  const newsContainer = document.getElementById("news-articles");
  const loadingIndicator = document.getElementById("loading-indicator");
  const navLinks = document.querySelectorAll("#navigation-bar a");

  let currentCategory = "all"; // Текущая выбранная категория

  const fetchNews = async (category) => {
    loadingIndicator.style.display = "block";

    try {
      let url = "/api/news";
      if (category !== "all") {
        url += `?category=${category}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    } finally {
      loadingIndicator.style.display = "none";
    }
  };

  const displayNews = (articles) => {
    newsContainer.innerHTML = ""; // Clear previous content

    if (articles.length > 0) {
      const articlesToDisplay = articles.slice(0, 10); // Limit to 10 articles

      articlesToDisplay.forEach((article) => {
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
      newsContainer.innerHTML = "<p>No news available for this category.</p>";
    }
  };

  // Обработчик кликов по ссылкам в navigation bar
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const category = link.dataset.category;
      currentCategory = category; // Обновляем текущую категорию

      // Получаем новости для выбранной категории и отображаем их
      fetchNews(category)
        .then(displayNews)
        .catch((error) => {
          newsContainer.innerHTML = `<p>Error loading news: ${error.message}</p>`;
        });
    });
  });

  // Загружаем новости при загрузке страницы (по умолчанию все категории)
  fetchNews()
    .then(displayNews)
    .catch((error) => {
      newsContainer.innerHTML = `<p>Error loading news: ${error.message}</p>`;
    });
});
