document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  loadUniversities();
  loadMajors();

  // Check if on the profile page and handle authentication
  if (window.location.pathname === "/investor-profile") {
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

  // Event listeners for filters (if applicable on this page)
  const universitySelect = document.getElementById("university");
  const majorSelect = document.getElementById("major");
  const investmentSelect = document.getElementById("investment");

  if (universitySelect && majorSelect && investmentSelect) {
    universitySelect.addEventListener("change", applyFilters);
    majorSelect.addEventListener("change", applyFilters);
    investmentSelect.addEventListener("change", applyFilters);
  }
});

let allUsers = [];

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

function createUserItem(user) {
  const userItem = document.createElement("div");
  userItem.classList.add("student-item");

  const investment = user.investment ? `$${user.investment}/year` : "N/A";

  userItem.innerHTML = `
    <div class="user-avatar"></div> 
    <div class="user-details">
      <a href="profile?id=${user.id}">
        <h3>${user.name || "N/A"} ${user.surname || "N/A"}</h3>
      </a> 
      <p>${user.educationPlace || "N/A"}, ${
    user.primaryDegree || "N/A"
  }, ${investment}</p>
    </div>
  `;

  return userItem;
}

async function handleProfilePage() {
  try {
    const userData = await loadCurrentUserData();
    updateIconBar(userData);

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");

    if (!userId) {
      window.location.replace("/login-investor");
      return;
    }

    loadProfile(userId, userData);
  } catch (error) {
    handleError("Error checking authentication or loading profile:", error);
    window.location.replace("/login-investor");
  }
}

async function loadCurrentUserData() {
  try {
    const response = await fetch("/api/auth", {
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

    return userData;
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

function updateIconBar(userData) {
  const userProfile = document.querySelector(".user-profile");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  let profileImage = userProfile.querySelector("img");
  if (!profileImage) {
    profileImage = new Image();
    profileImage.alt = "User Profile";
    userProfile.appendChild(profileImage);
  }
  profileImage.src = userData.profileImage || "assets/icons/default-avatar.png";

  fetch(`/api/user/${userData.id}`)
    .then(handleFetchResponse)
    .then((user) => {
      let userNameSpan = dropdownMenu.querySelector(".user-name");
      if (!userNameSpan) {
        userNameSpan = document.createElement("span");
        userNameSpan.classList.add("user-name");
        dropdownMenu.querySelector("li:first-child").appendChild(userNameSpan);
      }
      const fullName = `${user.name} ${user.surname}`;
      userNameSpan.textContent = fullName.trim() || "User";
    })
    .catch(handleError("Error fetching user details:"));

  const profileLink = dropdownMenu.querySelector('a[href="/investor-profile"]');
  if (profileLink) {
    profileLink.href = `/investor-profile?id=${userData.id}`;
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

function loadMajors() {
  fetch("/api/majors")
    .then(handleFetchResponse)
    .then((majors) => {
      populateDropdown("major", majors);
    })
    .catch(handleError("Error fetching majors"));
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
  const selectedMajor = majorSelect.value;
  const selectedInvestment = investmentSelect.value;

  const isUniversityFilterApplied = selectedUniversity !== "University";
  const isMajorFilterApplied = selectedMajor !== "Major";

  let filteredUsers = allUsers;

  if (isUniversityFilterApplied || isMajorFilterApplied) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        (!isUniversityFilterApplied ||
          user.educationPlace === selectedUniversity) &&
        (!isMajorFilterApplied || user.primaryDegree === selectedMajor)
    );
  }

  if (selectedInvestment !== "Investment") {
    const [min, max] = selectedInvestment
      .split("-")
      .map(val.map((val) => parseInt(val.replace("$", ""))));
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

function updateStudentList(filteredUsers) {
  const studentList = document.getElementById("student-list");
  studentList.innerHTML = "";

  filteredUsers.forEach((user) => {
    const userItem = createUserItem(user);
    studentList.appendChild(userItem);
  });
}

function showLoadingIndicator() {
  const loadingContainer = document.getElementById("loading-indicator");
  if (loadingContainer) {
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
    hideLoadingIndicator();
    console.error(defaultMessage, error);
    showError(error.message || defaultMessage);
  };
}
