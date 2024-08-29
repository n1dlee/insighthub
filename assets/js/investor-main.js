const universitySelect = document.getElementById("university");
const majorSelect = document.getElementById("major");
const investmentSelect = document.getElementById("investment");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    allMajors = await loadMajors();
    populateDropdown("major", allMajors);
    loadUsers();
    loadUniversities();
    loadMajors();
  } catch (error) {
    showError(error.message);
  }
  // Check if on the profile page and handle authentication
  if (window.location.pathname === "/investor-profile") {
    handleProfilePage();
  } else if (window.location.pathname === "/login") {
    // Logic specific to the login page (if any)
  }

  const studentList = document.getElementById("student-list");
  if (studentList) {
    // Call updateStudentList only when studentList is available
    updateStudentList(allUsers);
  } else {
    console.error("Student list element not found");
  }

  // Attach logout functionality (if applicable on this page)
  const logoutLink = document.querySelector('.dropdown-menu a[href="/logout"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
    });
  }

  if (universitySelect && majorSelect && investmentSelect) {
    universitySelect.addEventListener("change", applyFilters);
    majorSelect.addEventListener("change", applyFilters);
    investmentSelect.addEventListener("change", applyFilters);
  }
});

let allUsers = [];
let allMajors = [];

function loadUsers() {
  showLoadingIndicator();

  fetch("/api/users") // Assuming you have a route to fetch all users
    .then(handleFetchResponse)
    .then((users) => {
      allUsers = users;
      updateStudentList(users);
      hideLoadingIndicator();
    })
    .catch(handleError("Error loading user data"));
}

function createUserItem(user, majorsData) {
  const userItem = document.createElement("div");
  userItem.classList.add("student-item");

  const investment = user.investment ? `$${user.investment}/year` : "N/A";

  const major = majorsData.find((major) => major.id === parseInt(user.major));
  const majorName = major ? major.name : "Major not provided";

  userItem.innerHTML = `
      <div class="user-avatar"></div> 
      <div class="user-details">
          <a href="profile?id=${user.id}">
              <h3>${user.name || "N/A"} ${user.surname || "N/A"}</h3>
          </a> 
          <p>${user.educationPlace || "N/A"}, ${majorName}, ${investment}</p>
      </div>
      <div class="brief-info-icon" data-student-id="${user.id}"></div> 
  `;

  // Add click event listener to the brief info icon
  const briefInfoIcon = userItem.querySelector(".brief-info-icon");
  briefInfoIcon.addEventListener("click", () => {
    showStudentPopup(user.id);
  });

  return userItem;
}

function getMajorName(majorId, majorsData) {
  const major = majorsData.find((major) => major.id === majorId);
  return major ? major.name : "Major not provided";
}

async function handleProfilePage() {
  try {
    const userData = await loadCurrentUserData();
    updateIconBar(userData);
    navBar(userData); // Corrected here

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");

    // Prioritize user ID from URL, fallback to authenticated user if none provided
    const profileIdToLoad = userId || userData.id;

    loadProfile(profileIdToLoad, userData);
  } catch (error) {
    if (error.message === "Unauthorized. Please log in.") {
      // Handle unauthorized access specifically (e.g., redirect to login)
      window.location.replace("/login-investor");
    } else {
      // Handle other errors gracefully
      handleError("Error checking authentication or loading profile:", error);
    }
  }
}

// Функция для отображения pop-up окна
async function showStudentPopup(studentId) {
  try {
    showLoadingIndicator();

    const response = await fetch(`/api/user/${studentId}`);
    if (!response.ok) {
      throw new Error(
        "Failed to fetch student data. Status: " + response.status
      );
    }
    const studentData = await response.json();

    // Заполняем pop-up данными студента
    document.getElementById(
      "popup-student-name"
    ).textContent = `${studentData.name} ${studentData.surname}`;
    document.getElementById("popup-student-email").textContent =
      studentData.email;

    // Устанавливаем изображение профиля (с обработкой ошибок)
    const popupAvatar = document.querySelector(".student-popup-avatar");
    const imageUrl = `/assets/uploads/${studentData.id}/image.png`;
    popupAvatar.style.backgroundImage = `url(${imageUrl})`;

    popupAvatar.onerror = function () {
      popupAvatar.style.backgroundImage = "none"; // Сброс фона, если изображение не загрузилось
      popupAvatar.style.backgroundColor = "#ccc"; // Возврат к цвету по умолчанию
      console.error("Failed to load profile image. Using default.");
    };

    hideLoadingIndicator();

    // Показываем pop-up
    document.getElementById("student-popup").style.display = "block";

    // Добавляем обработчик события для закрытия pop-up при клике на крестик или вне области содержимого
    const closePopup = document.querySelector(".close-popup");
    const popup = document.getElementById("student-popup");
    closePopup.onclick = function () {
      popup.style.display = "none";
    };
    window.onclick = function (event) {
      if (event.target == popup) {
        popup.style.display = "none";
      }
    };
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading student data for the popup.");
    console.error("Error loading student data:", error);
  }
}

async function loadCurrentUserData() {
  try {
    const response = await fetch("/api/auth-investor", {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized. Please log in.");
      } else {
        throw new Error(
          "Network response was not ok. Status: " + response.status
        );
      }
    }

    const userData = await response.json();
    if (!userData || !userData.id) {
      throw new Error("No user data or ID found.");
    }

    // Теперь загружаем дополнительные данные пользователя по ID
    const userResponse = await fetch(`/api/user/${userData.id}`);
    if (!userResponse.ok) {
      throw new Error(
        "Failed to fetch additional user data. Status: " + userResponse.status
      );
    }

    const additionalUserData = await userResponse.json();

    // Объединяем данные из двух запросов
    const completeUserData = { ...userData, ...additionalUserData };

    return completeUserData;
  } catch (error) {
    handleError("Error checking authentication:", error);
    window.location.replace("/login-investor");
  }
}

async function loadProfile(userId, userData) {
  try {
    showLoadingIndicator();

    let profileData;
    if (userId === userData.id) {
      profileData = userData;
    } else {
      const response = await fetch(`/api/user/${userId}`);
      if (!response.ok) {
        throw new Error(
          "Failed to fetch profile data. Status: " + response.status
        );
      }
      profileData = await response.json();
    }

    populateProfile(profileData);
    hideLoadingIndicator();
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the profile.");
    console.error("Error loading profile data:", error);
  }
}

function populateProfile(profileData) {
  // Populate profile data using profileData
  document.getElementById("student-name").textContent = `${
    profileData.name || "N/A"
  } ${profileData.surname || "N/A"}`;
  // ... populate other fields similarly

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
}

function addBriefInfoIcon(studentContainer) {
  const img = document.createElement("img");
  img.src = "assets/icons/brief-info.png"; // Путь к вашему изображению
  img.alt = "Brief Info"; // Альтернативный текст для изображения
  img.classList.add("brief-info-icon"); // Добавьте класс для стилизации, если нужно

  studentContainer.appendChild(img);
}

function logout() {
  fetch("/api/logout", {
    method: "POST",
    credentials: "include",
  })
    .then(handleFetchResponse)
    .then(() => {
      window.location.href = "/login";
    })
    .catch(handleError("Error during logout:"));
}

async function updateIconBar() {
  const userNameSpan = document.getElementById("navbar-user-name");
  try {
    // Display a loading message while fetching data
    userNameSpan.textContent = "Loading user...";

    const userData = await loadCurrentUserData(); // Corrected call

    const userProfile = document.querySelector(".user-profile");

    // Set profile image (with error handling)
    let profileImage = userProfile.querySelector("img");
    if (!profileImage) {
      profileImage = new Image();
      profileImage.alt = "User Profile";
      userProfile.appendChild(profileImage);
    }

    profileImage.src =
      userData.profileImage || "assets/icons/default-avatar.png";
    profileImage.onerror = () => {
      profileImage.src = "assets/icons/default-avatar.png"; // Fallback if image fails to load
      console.error("Failed to load profile image. Using default.");
    };

    // Update user name using template literals
    userNameSpan.textContent = `${userData.name || "N/A"} ${
      userData.surname || "N/A"
    }`;

    // Update profile link
    if (userData && userData.id) {
      const profileLink = document.querySelector('a[href="/investor-profile"]');
      if (profileLink) {
        profileLink.href = `/investor-profile?id=${userData.id}`;
      }
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    userNameSpan.textContent = "Error loading user data";
  }
}

async function navBar(profileData, currentUserId) {
  try {
    document.getElementById("loading-investor-name").textContent = `${
      profileData.name || "N/A"
    } ${profileData.surname || "N/A"}`;
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the profile.");
    console.error("Error loading profile data:", error);
  }
}

function loadUniversities() {
  fetch("/api/universities", {
    headers: {
      "Accept-Charset": "utf-8",
    },
  })
    .then(handleFetchResponse)
    .then((universities) => {
      populateDropdown("university", universities);
    })
    .catch(handleError("Error fetching universities"));
}

async function loadMajors() {
  try {
    const response = await fetch("/api/majors");
    if (!response.ok) {
      throw new Error(
        "Failed to fetch majors data. Status: " + response.status
      );
    }
    const majors = await response.json();
    allMajors = majors;
    return majors;
  } catch (error) {
    handleError("Error fetching majors:")(error);
  }
}

function populateDropdown(dropdownId, data) {
  const selectElement = document.getElementById(dropdownId);
  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    option.text = item.name;
    selectElement.appendChild(option);
  });
}

function applyFilters() {
  const selectedUniversity = universitySelect.value;
  const selectedMajorName = majorSelect.value.trim().toLowerCase();
  const selectedInvestment = investmentSelect.value;

  const isUniversityFilterApplied = selectedUniversity !== "University";
  const isMajorFilterApplied = selectedMajorName !== "major";

  let filteredUsers = allUsers;

  console.log("All Users:", allUsers);

  // Фильтрация по университету и специальности
  if (isUniversityFilterApplied || isMajorFilterApplied) {
    filteredUsers = filteredUsers.filter((user) => {
      const userMajorId = parseInt(user.major); // Получаем ID специальности пользователя

      // Находим ID специальности, соответствующий выбранному названию специальности
      const selectedMajor = allMajors.find(
        (major) => major.name.trim().toLowerCase() === selectedMajorName
      );

      const selectedMajorId = selectedMajor ? selectedMajor.id : null;

      return (
        (!isUniversityFilterApplied ||
          user.educationPlace === selectedUniversity) &&
        (!isMajorFilterApplied || userMajorId === selectedMajorId)
      );
    });
  }

  // Фильтрация по инвестициям
  if (selectedInvestment !== "Investment") {
    const [min, max] = selectedInvestment
      .split("-")
      .map((val) => parseInt(val.replace("$", "")));
    filteredUsers = filteredUsers.filter(
      (user) => user.investment >= min && user.investment <= max
    );
  }

  updateStudentList(filteredUsers);

  if (filteredUsers.length === 0) {
    showError("No students found matching the selected filters.");
  } else {
    hideError();
  }
}

// Update the student list by applying filters and creating user items
async function updateStudentList(filteredUsers) {
  const studentList = document.getElementById("student-list");
  studentList.innerHTML = "";

  // Ensure that majors data is loaded before updating the student list
  const majorsData = await loadMajors();

  filteredUsers.forEach((user) => {
    const userItem = createUserItem(user, majorsData);
    addBriefInfoIcon(userItem);

    studentList.appendChild(userItem);
  });
}

function showLoadingIndicator() {
  const loadingContainer = document.getElementById("loading-indicator");
  const formElements = document.querySelectorAll("form input, form select");
  formElements.forEach((el) => (el.disabled = true));

  if (loadingContainer) {
    loadingContainer.style.opacity = 0;
    loadingContainer.style.display = "block";

    requestAnimationFrame(function fadeIn() {
      let opacity = parseFloat(loadingContainer.style.opacity);
      opacity += 0.1;
      loadingContainer.style.opacity = opacity;

      if (opacity < 1) {
        requestAnimationFrame(fadeIn);
      }
    });
  }
}

function hideLoadingIndicator() {
  const loadingContainer = document.getElementById("loading-indicator");
  const formElements = document.querySelectorAll("form input, form select");
  formElements.forEach((el) => (el.disabled = false));

  if (loadingContainer) {
    requestAnimationFrame(function fadeOut() {
      let opacity = parseFloat(loadingContainer.style.opacity);
      opacity -= 0.1;
      loadingContainer.style.opacity = opacity;

      if (opacity > 0) {
        requestAnimationFrame(fadeOut);
      } else {
        loadingContainer.style.display = "none";
      }
    });
  }
}

function showError(message) {
  const errorMessageElement = document.getElementById("error-message");
  errorMessageElement.textContent = message;
  errorMessageElement.style.display = "block";
}

function hideError() {
  const errorMessageElement = document.getElementById("error-message");
  errorMessageElement.textContent = "";
  errorMessageElement.style.display = "none";
}

// Helper function to handle fetch responses
function handleFetchResponse(response) {
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

// Helper function to create error handlers
function handleError(defaultMessage) {
  return (error) => {
    console.error(defaultMessage, error);
    showError(error.message || defaultMessage);
    alert("An error occurred: " + (error.message || defaultMessage)); // Additional feedback
  };
}
