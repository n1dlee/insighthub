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
  if (window.location.pathname === "/profile") {
    handleProfilePage();
  } else if (window.location.pathname === "/login") {
    // Logic specific to the login page (if any)
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

  // Find the major name using the major ID from the user data
  const major = majorsData.find((major) => major.id === parseInt(user.major));
  const majorName = major ? major.name : "Major not provided";

  // Construct the path to the user's image
  const userImageSrc = `assets/uploads/${user.id}/image.png`;

  userItem.innerHTML = `
    <div class="user-avatar">
      <img src="${userImageSrc}" alt="${
    user.name || "User"
  }'s avatar" onerror="this.src='assets/icons/default-avatar.png';">
    </div> 
    <div class="user-details">
      <a href="profile?id=${user.id}">
        <h3>${user.name || "N/A"} ${user.surname || "N/A"}</h3>
      </a> 
      <p>${user.educationPlace || "N/A"}, ${majorName}, ${investment}</p>
    </div>
  `;

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
    navBar(profileData);

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");

    // Prioritize user ID from URL, fallback to authenticated user if none provided
    const profileIdToLoad = userId || userData.id;

    loadProfile(profileIdToLoad, userData);
  } catch (error) {
    if (error.message === "Unauthorized. Please log in.") {
      // Handle unauthorized access specifically (e.g., redirect to login)
      window.location.replace("/login-student");
    } else {
      // Handle other errors gracefully
      handleError("Error checking authentication or loading profile:", error);
    }
  }
}

async function loadCurrentUserData() {
  try {
    const response = await fetch("/api/auth-student", {
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
    window.location.replace("/login-student");
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
      const profileLink = document.querySelector('a[href="/profile"]');
      if (profileLink) {
        profileLink.href = `/profile?id=${userData.id}`;
      }
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    userNameSpan.textContent = "Error loading user data";
  }
}

async function navBar(profileData, currentUserId) {
  try {
    document.getElementById("loading-student-name").textContent = `${
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
    studentList.appendChild(userItem);
  });
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
