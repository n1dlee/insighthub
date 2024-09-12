document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("DOM fully loaded and parsed");
    const userData = await loadCurrentUserData();
    await navBar(userData);
    console.log("navBar function completed");

    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get("id");

    if (!profileUserId) {
      console.log("No profile ID found, redirecting to login");
      window.location.replace("/login-student");
      return;
    }

    const logoutLink = document.querySelector(
      '.dropdown-menu a[href="/logout"]'
    );
    if (logoutLink) {
      logoutLink.addEventListener("click", async (event) => {
        event.preventDefault();
        await logout();
      });
    }

    await loadProfile(profileUserId, userData);
  } catch (error) {
    console.error("Error during page initialization:", error);
    handleError("Error checking authentication or loading profile:", error);
  }
});

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

    addChangeProfileIcon(profileUserId, currentUserData.id);
    addChatButton(profileUserId, currentUserData.id);

    const majorsData = await loadMajors();

    populateProfile(profileData, currentUserData.id, majorsData);
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the profile.");
    console.error("Error loading profile data:", error);
  }
}

async function populateProfile(profileData, currentUserId, majorsData) {
  try {
    console.log("Loading profile for user:", profileData);

    document.getElementById("student-name").textContent = `${
      profileData.name || "N/A"
    } ${profileData.surname || "N/A"}`;

    document.getElementById("student-location").textContent =
      profileData.location || "Location not provided";

    document.getElementById("student-bio").textContent =
      profileData.bio || "Bio not provided";

    document.getElementById("student-education").textContent =
      profileData.educationPlace || "Education not provided";

    const majorsArray = Array.isArray(majorsData) ? majorsData : [];

    if (majorsArray.length === 0) {
      console.error(
        "No majors data available or data is not in the expected format."
      );
    }

    const major = majorsArray.find(
      (major) => major.id === parseInt(profileData.major)
    );

    const majorName = major ? major.name : "Major not provided";

    document.getElementById("student-major").textContent = majorName;

    document.getElementById("student-gpa").textContent =
      profileData.gpa || "N/A";
    document.getElementById("student-sat").textContent =
      profileData.sat || "N/A";
    document.getElementById("student-ielts").textContent =
      profileData.ielts || "N/A";

    addChangeProfileIcon(profileData.id, currentUserId);
    addChatButton(profileData.id, currentUserId);

    document.getElementById("student-achievements").textContent =
      profileData.achievements || "Achievements not provided";

    const profileImage = document.getElementById("profile-image");
    const imageUrl = `/assets/uploads/${profileData.id}/image.png`; // Construct the image URL
    profileImage.src = imageUrl;

    profileImage.onerror = function () {
      profileImage.src = "assets/icons/default-image.png"; // Fall back to a default image
    };

    profileImage.classList.add("user-avatar-img");

    hideLoadingIndicator();
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the profile.");
    console.error("Error loading profile data:", error);
  }
}

async function navBar(userData) {
  const userProfileWrapper = document.querySelector(".user-profile-wrapper");
  const userNameElement = document.getElementById("loading-student-name");

  console.log("navBar function called");

  try {
    if (!userData) {
      userData = await loadCurrentUserData();
    }
    console.log("User data in navBar:", userData);

    if (userNameElement && userData) {
      const fullName =
        `${userData.name || ""} ${userData.surname || ""}`.trim() || "N/A";
      userNameElement.textContent = fullName;
      console.log("Set user name:", fullName);
    } else {
      console.log(
        "Unable to set user name. userNameElement:",
        userNameElement,
        "userData:",
        userData
      );
    }

    if (userProfileWrapper) {
      const profileImage =
        userProfileWrapper.querySelector(".user-profile img");
      if (profileImage && userData.id) {
        const userImageSrc = `assets/uploads/${userData.id}/image.png`;
        profileImage.src = userImageSrc;
        console.log("Set profile image source:", userImageSrc);

        profileImage.onerror = () => {
          console.error("Failed to load user profile image. Using default.");
          profileImage.src = "assets/icons/default-image.png";
        };
      }
    }

    const profileLink = document.querySelector(
      '.dropdown-menu a[href^="/profile"]'
    );
    if (profileLink && userData.id) {
      profileLink.href = `/profile?id=${userData.id}`;
      console.log("Updated profile link:", profileLink.href);
    }
  } catch (error) {
    console.error("Error in navBar function:", error);
    if (userNameElement) {
      userNameElement.textContent = "Error loading user data";
    }
  }
}

// Function to handle navigation to the profile page
function navigateToProfile(userId) {
  if (userId) {
    console.log("Navigating to profile:", `/profile?id=${userId}`);
    window.location.href = `/profile?id=${userId}`;
  } else {
    console.error("User ID is missing. Unable to navigate to profile.");
  }
}

async function loadCurrentUserData() {
  try {
    const response = await fetch("/api/auth-student", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Initial user data:", data);

    if (!data || !data.id) {
      throw new Error("Invalid user data received from server");
    }

    // Fetch full user data
    const fullDataResponse = await fetch(`/api/user/${data.id}`);
    if (!fullDataResponse.ok) {
      throw new Error(`HTTP error! Status: ${fullDataResponse.status}`);
    }

    const fullData = await fullDataResponse.json();
    console.log("Full user data:", fullData);

    return fullData;
  } catch (error) {
    console.error("Error in loadCurrentUserData:", error);
    throw error;
  }
}

function addChangeProfileIcon(profileDataId, currentUserId) {
  const studentNameElement = document.getElementById("student-name");

  if (profileDataId === currentUserId && studentNameElement) {
    const existingIcon = studentNameElement.querySelector(
      ".change-profile-icon"
    );
    if (!existingIcon) {
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
}

function addChatButton(profileDataId, currentUserId) {
  const studentNameElement = document.getElementById("student-name");
  if (profileDataId !== currentUserId && studentNameElement) {
    const existingButton = studentNameElement.querySelector(".chat-button");
    if (!existingButton) {
      const chatButton = document.createElement("a");
      chatButton.href = `/chat?id=${profileDataId}`;
      chatButton.className = "chat-button";

      const chatIcon = document.createElement("img");
      chatIcon.src = "assets/icons/chat_btn.png";
      chatIcon.alt = "Chat";
      chatIcon.className = "chat-icon";

      chatButton.appendChild(chatIcon);
      studentNameElement.appendChild(chatButton);
    }
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
