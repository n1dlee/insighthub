document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const investorId = urlParams.get("id"); // ID инвестора из URL

  if (!investorId) {
    window.location.replace("/login"); // Перенаправление на страницу входа, если ID не найден
    return;
  }

  try {
    const currentUserData = await loadCurrentUserData(); // Загрузка данных текущего пользователя

    const logoutLink = document.querySelector(
      '.dropdown-menu a[href="/logout"]'
    );
    if (logoutLink) {
      logoutLink.addEventListener("click", async (event) => {
        event.preventDefault();
        await logout(); // Выход из системы
      });
    }

    loadProfile(investorId, currentUserData); // Загрузка профиля инвестора
  } catch (error) {
    handleError("Error checking authentication or loading profile:", error);
    window.location.replace("/login"); // Перенаправление на страницу входа в случае ошибки
  }
});

// Функция для загрузки данных текущего пользователя
async function loadCurrentUserData() {
  try {
    const response = await fetch("/api/auth-investor", {
      // Запрос к API для аутентификации инвестора
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Error response from /api/auth-investor:",
        response.status,
        errorText
      );

      if (response.status === 401) {
        throw new Error("Unauthorized. Please log in.");
      } else {
        throw new Error(
          `Network response was not ok. Status: ${response.status}. Server message: ${errorText}`
        );
      }
    }

    const currentUserData = await response.json();
    if (!currentUserData || !currentUserData.id) {
      console.error("Invalid user data received from server:", currentUserData);
      throw new Error("No user data or ID found.");
    }

    return currentUserData;
  } catch (error) {
    console.error("Error checking authentication:", error);
    throw error;
  }
}

// Функция для загрузки профиля инвестора
async function loadProfile(investorId, currentUserData) {
  try {
    showLoadingIndicator();

    let investorData;
    if (investorId === currentUserData.id) {
      // Если просматривается свой профиль
      investorData = currentUserData;
    } else {
      // Если просматривается профиль другого инвестора
      const response = await fetch(`/api/investor/${investorId}`);
      if (!response.ok) {
        throw new Error(
          "Failed to fetch profile data. Status: " + response.status
        );
      }
      investorData = await response.json();
    }

    populateProfile(investorData, currentUserData.id);
    navBar(investorData, currentUserData.id); // Обновление данных в навигационной панели
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the profile.");
    console.error("Error loading profile data:", error);
  }
}

// Функция для заполнения страницы профиля данными инвестора
function populateProfile(investorData, currentUserId) {
  try {
    console.log("Loading profile for investor:", investorData);

    const investorNameElement = document.getElementById("name");
    investorNameElement.textContent = `${investorData.name || "N/A"} ${
      investorData.surname || "N/A"
    }`;

    document.getElementById("location").textContent =
      investorData.location || "Location not provided";

    document.getElementById("bio").textContent =
      investorData.bio || "Bio not provided";

    const workHistoryContainer = document.getElementById(
      "work-history-container"
    );
    workHistoryContainer.innerHTML = "";

    if (investorData.workHistory) {
      try {
        const workHistory = JSON.parse(investorData.workHistory);
        populateExperienceSection(
          workHistoryContainer,
          workHistory,
          "Work History"
        );
      } catch (error) {
        console.error("Error parsing workHistory data:", error);
        workHistoryContainer.textContent = "Invalid work history data.";
      }
    } else {
      workHistoryContainer.textContent = "No work history provided.";
    }

    const workExperienceContainer = document.getElementById(
      "work-experience-container"
    );
    workExperienceContainer.innerHTML = "";

    if (investorData.workExperience) {
      try {
        const workExperience = JSON.parse(investorData.workExperience);
        populateExperienceSection(
          workExperienceContainer,
          workExperience,
          "Work Experience"
        );
      } catch (error) {
        console.error("Error parsing workExperience data:", error);
        workExperienceContainer.textContent = "Invalid work experience data.";
      }
    } else {
      workExperienceContainer.textContent = "No work experience provided.";
    }

    navBar(investorData, currentUserId.id);

    hideLoadingIndicator();
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while populating the profile.");
    console.error("Error populating profile data:", error);
  }
}

function addChangeProfileIcon(investorId) {
  const nameElement = document.getElementById("name"); // Получаем элемент с именем инвестора

  if (nameElement) {
    // Создаем ссылку для изменения профиля
    const changeProfileLink = document.createElement("a");
    changeProfileLink.href = `/investor-profile-change?id=${investorId}`;

    // Создаем иконку для изменения профиля
    const changeProfileIcon = document.createElement("img");
    changeProfileIcon.src = "assets/icons/change-profile.png"; // Путь к иконке
    changeProfileIcon.alt = "Change Profile";
    changeProfileIcon.className = "change-profile-icon";

    // Добавляем иконку в ссылку
    changeProfileLink.appendChild(changeProfileIcon);
    // Добавляем ссылку с иконкой к элементу с именем инвестора
    nameElement.appendChild(changeProfileLink);
  }
}

function populateExperienceSection(container, experiences, title) {
  if (Array.isArray(experiences) && experiences.length > 0) {
    experiences.forEach((experience) => {
      const experienceDiv = document.createElement("div");
      experienceDiv.innerHTML = `
              <h4>${experience.companyName || "N/A"} - ${
        experience.jobTitle || "N/A"
      }</h4>
              <p>${experience.startDate || "N/A"} - ${
        experience.endDate || "N/A"
      }</p>
              <p>${experience.description || "N/A"}</p>
          `;
      container.appendChild(experienceDiv);
    });
  } else {
    container.textContent = `No ${title} provided.`;
  }
}

// Функция для выхода из системы
async function logout() {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    window.location.replace("/login");
  } catch (error) {
    handleError("Error during logout:", error);
  }
}

// Функция для обновления данных в навигационной панели (navBar)
async function navBar(profileData, currentUserId) {
  try {
    // В данном случае, предполагаем, что в навигационной панели отображается только имя и фамилия текущего пользователя
    // Если требуется отображать больше данных или данные другого пользователя, измените логику соответственно

    const currentUserData = await loadCurrentUserData();

    document.querySelector(".user-name").textContent = `${
      currentUserData.name || "N/A"
    } ${currentUserData.surname || "N/A"}`;

    // Если просматривается свой профиль, добавляем ссылку на редактирование профиля
    if (profileData.id === currentUserId) {
      addChangeProfileIcon(profileData.id, currentUserId);
    }
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the user data.");
    console.error("Error loading user data:", error);
  }
}

// Вспомогательная функция для обработки ответов fetch
function handleFetchResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

// Функция для обработки ошибок
function handleError(defaultMessage) {
  return (error) => {
    console.error(defaultMessage, error);
    showError(error.message || defaultMessage);
    alert("An error occurred: " + (error.message || defaultMessage));
  };
}

// Функция для отображения индикатора загрузки
function showLoadingIndicator() {
  const loadingContainer = document.getElementById("loading-indicator");
  if (loadingContainer) {
    loadingContainer.textContent = "Loading...";
    loadingContainer.style.display = "block";
  }
}

// Функция для скрытия индикатора загрузки
function hideLoadingIndicator() {
  const loadingContainer = document.getElementById("loading-indicator");
  if (loadingContainer) {
    loadingContainer.style.display = "none";
  }
}

function showError(message) {
  const errorMessageElement = document.getElementById("error-message");
  if (errorMessageElement) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = "block";
  } else {
    console.error("Error message element not found:", message);
  }
}
