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
    const response = await fetch("/api/auth-student", {
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Error response from /api/auth-student:",
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

async function loadProfile(profileUserId, currentUserData) {
  try {
    showLoadingIndicator();

    let profileData;
    if (profileUserId === currentUserData.id) {
      profileData = currentUserData;
    } else {
      const response = await fetch(`/api/user/${profileUserId}`);
      if (!response.ok) {
        throw new Error(
          "Failed to fetch profile data. Status: " + response.status
        );
      }
      profileData = await response.json();
    }

    // Fetch majors data and await its resolution
    const majorsData = await loadMajors();

    populateProfile(profileData, currentUserData.id, majorsData);
    navBar(profileData, currentUserData.id);
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the profile.");
    console.error("Error loading profile data:", error);
  }
}

async function populateProfile(profileData, currentUserId, majorsData) {
  try {
    console.log("Loading profile for user:", profileData);

    // Update student name and surname
    const studentNameElement = document.getElementById("student-name");
    studentNameElement.textContent = `${profileData.name || "N/A"} ${
      profileData.surname || "N/A"
    }`;

    // Update location
    document.getElementById("student-location").textContent =
      profileData.location || "Location not provided";

    // Update bio
    document.getElementById("student-bio").textContent =
      profileData.bio || "Bio not provided";

    // Update education
    document.getElementById("student-education").textContent =
      profileData.educationPlace || "Education not provided";

    // Убедитесь, что majorsData является массивом
    const majorsArray = Array.isArray(majorsData) ? majorsData : [];

    if (majorsArray.length === 0) {
      console.error(
        "No majors data available or data is not in the expected format."
      );
    }

    // Найдите название major по ID major'а в profileData
    const major = majorsArray.find(
      (major) => major.id === parseInt(profileData.major)
    );

    // Если major найден, используем его название, если нет, указываем "Major not provided"
    const majorName = major ? major.name : "Major not provided";

    // Обновите поле major на странице
    document.getElementById("student-major").textContent = majorName;

    // Update statistics (GPA, SAT, IELTS)
    document.getElementById("student-gpa").textContent =
      profileData.gpa || "N/A";
    document.getElementById("student-sat").textContent =
      profileData.sat || "N/A";
    document.getElementById("student-ielts").textContent =
      profileData.ielts || "N/A";

    // Добавляем иконку изменения профиля, если это профиль текущего пользователя
    addChangeProfileIcon(profileData.id, currentUserId);

    // Update achievements
    document.getElementById("student-achievements").textContent =
      profileData.achievements || "Achievements not provided";

    // Update profile image
    const profileImage = document.getElementById("profile-image");
    profileImage.src =
      profileData.profile_image || "assets/icons/default-image.png";

    hideLoadingIndicator();
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the profile.");
    console.error("Error loading profile data:", error);
  }
}

async function navBar() {
  try {
    const currentUserData = await loadCurrentUserData();

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

  if (profileDataId === currentUserId && studentNameElement) {
    const changeProfileLink = document.createElement("a");
    changeProfileLink.href = `/profile-change?id=${profileDataId}`;

    const changeProfileIcon = document.createElement("img");
    changeProfileIcon.src = "assets/icons/change-profile.png";
    changeProfileIcon.alt = "Change Profile";
    changeProfileIcon.className = "change-profile-icon";

    changeProfileLink.appendChild(changeProfileIcon);
    studentNameElement.appendChild(changeProfileLink);
  }
}

async function onLoginSuccess() {
  try {
    const currentUserData = await loadCurrentUserData();

    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get("id");

    if (profileUserId) {
      loadProfile(profileUserId, currentUserData.id);
    } else {
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

async function loadMajors() {
  try {
    const response = await fetch("/api/majors");
    return handleFetchResponse(response);
  } catch (error) {
    handleError("Error fetching majors:", error);
    throw error; // Re-throw the error to be caught in loadProfile
  }
}

function showLoadingIndicator() {
  const loadingContainer = document.getElementById("loading-indicator");
  const formElements = document.querySelectorAll("form input, form select");
  formElements.forEach((el) => (el.disabled = true)); // Disable form elements
  if (loadingContainer) loadingContainer.style.display = "block";
}

function hideLoadingIndicator() {
  const loadingContainer = document.getElementById("loading-indicator");
  const formElements = document.querySelectorAll("form input, form select");
  formElements.forEach((el) => (el.disabled = false)); // Enable form elements
  if (loadingContainer) loadingContainer.style.display = "none";
}

function showError(message) {
  const errorMessageElement = document.getElementById("error-message");
  if (errorMessageElement) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = "block";
  }
}

function handleFetchResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

function handleError(defaultMessage) {
  return (error) => {
    console.error(defaultMessage, error);
    showError(error.message || defaultMessage);
    alert("An error occurred: " + (error.message || defaultMessage)); // Additional feedback
  };
}
