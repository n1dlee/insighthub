document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get("id");

  if (!profileUserId) {
    window.location.replace("/login-student");
    return;
  }

  try {
    const currentUserData = await loadCurrentUserData();

    const logoutLink = document.querySelector(
      '.dropdown-menu a[href="/logout"]'
    );
    if (logoutLink) {
      logoutLink.addEventListener("click", async (event) => {
        event.preventDefault();
        await logout();
      });
    }

    loadProfile(profileUserId, currentUserData);
  } catch (error) {
    handleError("Error checking authentication or loading profile:", error);
    window.location.replace("/login-student");
  }
});

async function loadCurrentUserData() {
  try {
    const response = await fetch("/api/auth-student", { // Assuming this is the correct endpoint based on your controller
      credentials: "include", // This is important for sending cookies
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from /api/auth-student:", response.status, errorText);

      if (response.status === 401) {
        throw new Error("Unauthorized. Please log in.");
      } else {
        throw new Error(`Network response was not ok. Status: ${response.status}. Server message: ${errorText}`);
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
    throw error; // Re-throw the error to be handled by the calling function
  }
}

async function loadProfile(profileUserId, currentUserData) {
  try {
    showLoadingIndicator();

    let profileData;
    if (profileUserId === currentUserData.id) {
      profileData = currentUserData; // Используем данные из /api/auth для текущего пользователя
    } else {
      const response = await fetch(`/api/user/${profileUserId}`);
      if (!response.ok) {
        console.error(
          "Error response from /api/user/{profileUserId}:",
          response.status,
          await response.text()
        );
        throw new Error(
          "Failed to fetch profile data. Status: " + response.status
        );
      }
      profileData = await response.json();
    }

    populateProfile(profileData, currentUserData.id); // Передаем ID текущего пользователя
    navBar(profileData, currentUserData.id);
    hideLoadingIndicator();
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the profile.");
    console.error("Error loading profile data:", error);
  }
}

async function populateProfile(profileData, currentUserId) {
  try {
    console.log("Loading profile for user:", profileData);

    showLoadingIndicator();

    document.getElementById("student-name").textContent = `${
      profileData.name || "N/A"
    } ${profileData.surname || "N/A"}`;
    document.getElementById("student-location").textContent =
      profileData.location || "Location not provided";
    document.getElementById("student-role").textContent =
      profileData.role || "Student";
    document.getElementById("student-bio").textContent =
      profileData.bio || "N/A";
    document.getElementById("student-education").textContent =
      profileData.educationPlace || "N/A";
    document.getElementById("student-major").textContent =
      profileData.major || "N/A";
    document.getElementById("student-statistics").textContent =
      profileData.statistics || "N/A";

    // Добавляем иконку изменения профиля только если текущий пользователь просматривает свой профиль
    addChangeProfileIcon(profileData.id, currentUserId);

    const achievementsList = document.getElementById("student-achievements");
    achievementsList.innerHTML = "";

    if (
      Array.isArray(profileData.achievements) &&
      profileData.achievements.length > 0
    ) {
      profileData.achievements.forEach((achievement) => {
        const listItem = document.createElement("li");
        listItem.textContent = achievement;
        achievementsList.appendChild(listItem);
      });
    } else {
      achievementsList.textContent = "No achievements found";
    }

    hideLoadingIndicator();
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the profile.");
    console.error("Error loading profile data:", error);
  }
}

async function navBar() {
  try {
    const currentUserData = await loadCurrentUserData(); // Load current user data using the provided function

    document.getElementById("loading-student-name").textContent = `${
      currentUserData.name || "N/A"
    } ${currentUserData.surname || "N/A"}`;
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the user data.");
    console.error("Error loading user data:", error);
  }
}


function addChangeProfileIcon(profileDataId, currentUserId) {
  const studentNameElement = document.getElementById("student-name");

  // Проверяем, совпадают ли ID текущего пользователя и ID профиля
  if (profileDataId === currentUserId) {
    const changeProfileLink = document.createElement("a");
    changeProfileLink.href = `/profile-change?id=${profileDataId}`;

    const changeProfileIcon = document.createElement("img");
    changeProfileIcon.src = "assets/icons/change-profile.png";
    changeProfileIcon.alt = "Change Profile";
    changeProfileIcon.classList.add("change-profile-icon");

    changeProfileLink.appendChild(changeProfileIcon);
    studentNameElement.appendChild(changeProfileLink);
  }
}

async function onLoginSuccess() {
  // ... (другой код, связанный с логином, например, скрытие формы логина и т.д.)

  try {
    const currentUserData = await loadCurrentUserData(); // Обновляем данные текущего пользователя

    // Получаем ID пользователя из URL (предполагается, что он там есть после логина)
    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get("id");

    if (profileUserId) {
      loadProfile(profileUserId, currentUserData.id); // Загружаем профиль с обновленными данными
    } else {
      // Если ID пользователя не найден в URL, можно перенаправить на страницу профиля
      // или выполнить другое действие, в зависимости от логики вашего приложения
      window.location.replace(`/profile?id=${currentUserData.id}`);
    }
  } catch (error) {
    handleError("Error updating user data after login:", error);
  }
}

async function logout() {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    window.location.replace("/login-student");
  } catch (error) {
    handleError("Error during logout:", error);
  }
}

function showLoadingIndicator() {
  const loadingContainer = document.getElementById("loading-indicator");
  if (loadingContainer) {
    loadingContainer.textContent = "Loading...";
    loadingContainer.style.display = "block";
  }
}

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
  }
}
