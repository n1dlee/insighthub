let universitySelect, majorSelect, investmentSelect, studentNameInput;
let allUsers = [];
let allMajors = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Initialize DOM elements
    initializeFilterElements();

    // Load data
    allMajors = await loadMajors();
    await loadUniversities();
    await loadUsers();

    // Populate dropdowns
    if (majorSelect) populateDropdown("major", allMajors);

    await updateIconBar();

    if (window.location.pathname === "/profile") {
      handleProfilePage();
    } else if (window.location.pathname === "/login") {
      // Handle login page specifics if needed
    }

    // Attach event listeners
    attachEventListeners();

    // Apply initial filters
    applyFilters();
  } catch (error) {
    console.error("Error during page initialization:", error);
    showError(
      "An error occurred while loading the page. Please try refreshing."
    );
  }
});

function initializeFilterElements() {
  universitySelect = document.getElementById("university");
  majorSelect = document.getElementById("major");
  investmentSelect = document.getElementById("investment");
  studentNameInput = document.getElementById("student-name-input");

  console.log("Filter elements initialization:");
  console.log("universitySelect:", universitySelect);
  console.log("majorSelect:", majorSelect);
  console.log("investmentSelect:", investmentSelect);
  console.log("studentNameInput:", studentNameInput);
}

function attachEventListeners() {
  // Attach logout functionality (if applicable on this page)
  const logoutLink = document.querySelector('.dropdown-menu a[href="/logout"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
    });
  }

  // Attach filter event listeners
  if (universitySelect)
    universitySelect.addEventListener("change", applyFilters);
  if (majorSelect) majorSelect.addEventListener("change", applyFilters);
  if (investmentSelect)
    investmentSelect.addEventListener("change", applyFilters);
  if (studentNameInput)
    studentNameInput.addEventListener("input", debounce(applyFilters, 300));
}

function attachEventListeners() {
  // Attach logout functionality (if applicable on this page)
  const logoutLink = document.querySelector('.dropdown-menu a[href="/logout"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
    });
  }

  // Attach filter event listeners
  if (universitySelect)
    universitySelect.addEventListener("change", applyFilters);
  if (majorSelect) majorSelect.addEventListener("change", applyFilters);
  if (investmentSelect)
    investmentSelect.addEventListener("change", applyFilters);
  if (studentNameInput)
    studentNameInput.addEventListener("input", debounce(applyFilters, 300));
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function loadUsers() {
  showLoadingIndicator();

  try {
    const response = await fetch("/api/users");
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    allUsers = await response.json();
    hideLoadingIndicator();
  } catch (error) {
    handleError("Error loading user data")(error);
    hideLoadingIndicator();
  }
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
      <button class="info-button" style="float: left;">Show Info</button>
      <a href="profile?id=${user.id}">
        <h3>${user.name || "N/A"} ${user.surname || "N/A"}</h3>
      </a> 
      <p>${user.educationPlace || "N/A"}, ${majorName}</p>
    </div>
  `;

  // Add event listener to the button
  const infoButton = userItem.querySelector(".info-button");
  infoButton.style.backgroundColor = "#4CAF50";
  infoButton.style.color = "#fff";
  infoButton.style.padding = "10px 20px";
  infoButton.style.fontSize = "16px";
  infoButton.style.cursor = "pointer";
  infoButton.style.position = "absolute";
  infoButton.style.border = "none";
  infoButton.style.borderRadius = "25px";

  infoButton.style.top = "25%";
  infoButton.style.right = "15px";

  infoButton.addEventListener("click", () => {
    // Create a popup container
    const popupContainer = document.createElement("div");
    popupContainer.classList.add("popup-container");
    popupContainer.style.position = "fixed";
    popupContainer.style.top = "50%";
    popupContainer.style.left = "50%";
    popupContainer.style.transform = "translate(-50%, -50%)";
    popupContainer.style.width = "300px";
    popupContainer.style.height = "400px";
    popupContainer.style.background = "white";
    popupContainer.style.borderRadius = "10px";
    popupContainer.style.padding = "20px";
    popupContainer.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.5)";
    popupContainer.style.zIndex = "1000";

    // Create an overlay element
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0, 0, 0, 0.5)";
    overlay.style.zIndex = "999";

    // Add the overlay to the body
    document.body.appendChild(overlay);

    // Add content to the popup
    const popupContent = `
      <img src="${userImageSrc}" alt="${
      user.name || "User"
    }'s avatar" onerror="this.src='assets/icons/default-avatar.png';" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 40px; display: block; margin: 0 auto;">
      <h2 style="margin-top: 20px;">${user.name || "N/A"} ${
      user.surname || "N/A"
    } </h2>
      <p>Education Place: ${user.educationPlace || "N/A"}</p>
      <p>Major: ${majorName}</p>
      <p>Investment: ${investment}</p>
      <p>Email: ${user.email}</p>
    `;
    popupContainer.innerHTML = popupContent;

    // Add a close button to the popup
    const closeButton = document.createElement("button");
    closeButton.textContent = "X";
    closeButton.style.fontWeight = "900";
    closeButton.style.fontSize = "20px";
    closeButton.style.position = "absolute";
    closeButton.style.border = "none";
    closeButton.style.backgroundColor = "white";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.addEventListener("click", () => {
      popupContainer.remove();
      overlay.remove();
    });
    popupContainer.appendChild(closeButton);

    // Add the popup to the body
    document.body.appendChild(popupContainer);
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
    updateIconBar();

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");

    const profileIdToLoad = userId || userData.id;

    loadProfile(profileIdToLoad, userData);
  } catch (error) {
    if (error.message === "Unauthorized. Please log in.") {
      window.location.replace("/login-investor");
    } else {
      handleError("Error checking authentication or loading profile:")(error);
    }
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
    const userResponse = await fetch(`/api/investor/${userData.id}`);
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
  const userProfileWrapper = document.querySelector(".user-profile-wrapper");
  const userNameElement = document.getElementById("loading-student-name");

  try {
    if (userNameElement) {
      userNameElement.textContent = "Loading...";
    }

    const userData = await loadCurrentUserData();

    if (userProfileWrapper) {
      const profileImage =
        userProfileWrapper.querySelector(".user-profile img");
      if (profileImage && userData.id) {
        const userImageSrc = `assets/uploads/investor/${userData.id}/image.png`;
        profileImage.src = userImageSrc;

        profileImage.onerror = () => {
          console.error("Failed to load user profile image. Using default.");
          profileImage.src = "assets/icons/default-image.png";
        };
      }
    }

    if (userNameElement && userData) {
      userNameElement.textContent =
        `${userData.name || ""} ${userData.surname || ""}`.trim() || "N/A";
    }

    const profileLink = document.querySelector('a[href="/investor-profile"]');
    if (profileLink && userData && userData.id) {
      profileLink.href = `/investor-profile?id=${userData.id}`;
      profileLink.addEventListener("click", (event) => {
        event.preventDefault();
        navigateToProfile(userData.id);
      });
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    if (userNameElement) {
      userNameElement.textContent = "Error loading user data";
    }
  }
}

// Function to handle navigation to the profile page
function navigateToProfile(userId) {
  if (userId) {
    window.location.href = `/investor-profile?id=${userId}`;
  } else {
    console.error("User ID is missing. Unable to navigate to profile.");
  }
}

function navBar(userData) {
  const navbarUserName = document.getElementById("navbar-user-name");
  if (navbarUserName && userData) {
    navbarUserName.textContent = `${userData.name || "N/A"} ${
      userData.surname || "N/A"
    }`;
  }

  const profileLink = document.querySelector('a[href="/investor-profile"]');
  if (profileLink && userData && userData.id) {
    profileLink.href = `/investor-profile?id=${userData.id}`;
    profileLink.addEventListener("click", (event) => {
      event.preventDefault();
      navigateToProfile(userData.id);
    });
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
  const missingElements = [];
  if (!universitySelect) missingElements.push("university");
  if (!majorSelect) missingElements.push("major");
  if (!investmentSelect) missingElements.push("investment");
  if (!studentNameInput) missingElements.push("student-name-input");

  if (missingElements.length > 0) {
    console.warn(
      `The following filter elements are missing: ${missingElements.join(", ")}`
    );
    // Если элементы отсутствуют, возможно, мы находимся на странице, где фильтрация не нужна
    return;
  }

  const selectedUniversity = universitySelect.value;
  const selectedMajorName = majorSelect.value.trim().toLowerCase();
  const selectedInvestment = investmentSelect.value;
  const searchName = studentNameInput.value.trim().toLowerCase();

  const filteredUsers = allUsers.filter((user) => {
    const universityMatch =
      selectedUniversity === "University" ||
      user.educationPlace === selectedUniversity;

    const majorMatch =
      selectedMajorName === "major" ||
      allMajors
        .find((major) => major.id === parseInt(user.major))
        ?.name.trim()
        .toLowerCase() === selectedMajorName;

    const nameMatch = `${user.name} ${user.surname}`
      .toLowerCase()
      .includes(searchName);

    let investmentMatch = true;
    if (selectedInvestment !== "Investment") {
      const [min, max] = selectedInvestment
        .split("-")
        .map((val) => parseInt(val.replace("$", "").replace(",", "")));
      investmentMatch = user.investment >= min && user.investment <= max;
    }

    return universityMatch && majorMatch && nameMatch && investmentMatch;
  });

  updateStudentList(filteredUsers);

  if (filteredUsers.length === 0) {
    showError("No students found matching the selected filters.");
  } else {
    hideError();
  }
}

function updateStudentList(filteredUsers) {
  const studentList = document.getElementById("student-list");
  studentList.innerHTML = "";

  filteredUsers.forEach((user) => {
    const userItem = createUserItem(user, allMajors);
    studentList.appendChild(userItem);
  });
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
