document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get("id");

  if (!profileUserId) {
    window.location.replace("/login-investor");
    return;
  }

  try {
    await navBar();
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

    await loadProfile(profileUserId, currentUserData);
  } catch (error) {
    handleError("Error checking authentication or loading profile:", error);
    window.location.replace("/login-investor");
  }
});

async function loadCurrentUserData() {
  try {
    const response = await fetch("/api/auth-investor", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Loaded user data:", data);

    if (!data || !data.id) {
      throw new Error("Invalid user data received from server");
    }

    return data;
  } catch (error) {
    console.error("Error in loadCurrentUserData:", error);
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
      const response = await fetch(`/api/investor/${profileUserId}`);
      if (!response.ok) {
        throw new Error(
          "Failed to fetch profile data. Status: " + response.status
        );
      }
      profileData = await response.json();
    }

    populateProfile(profileData, currentUserData.id);
    await navBar(profileData);
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the profile.");
    console.error("Error loading profile data:", error);
  }
}

async function populateProfile(profileData, currentUserId) {
  try {
    console.log("Loading profile for investor:", profileData);

    const investorNameElement = document.getElementById("name");
    investorNameElement.textContent = `${profileData.name || "N/A"} ${
      profileData.surname || "N/A"
    }`;

    document.getElementById("location").textContent =
      profileData.location || "Location not provided";

    document.getElementById("bio").textContent =
      profileData.bio || "Bio not provided";

    populateExperienceSection(
      document.getElementById("work-history-container"),
      JSON.parse(profileData.workHistory || "[]"),
      "Work History"
    );

    populateExperienceSection(
      document.getElementById("work-experience-container"),
      JSON.parse(profileData.workExperience || "[]"),
      "Work Experience"
    );

    addChangeProfileIcon(profileData.id, currentUserId);

    const profileImage = document.getElementById("profile-image");
    if (profileImage) {
      const imageUrl = `/assets/uploads/investor/${profileData.id}/image.png`;
      profileImage.src = imageUrl;

      profileImage.onerror = function () {
        profileImage.src = "assets/icons/default-image.png";
      };

      profileImage.classList.add("user-avatar-img");
    } else {
      console.warn("Profile image element not found in the DOM");
    }

    hideLoadingIndicator();
  } catch (error) {
    hideLoadingIndicator();
    showError("An error occurred while loading the profile.");
    console.error("Error loading profile data:", error);
  }
}

function populateExperienceSection(container, experiences, title) {
  container.innerHTML = "";
  if (Array.isArray(experiences) && experiences.length > 0) {
    experiences.forEach((experience) => {
      const experienceDiv = document.createElement("div");
      experienceDiv.innerHTML = `
        <h4>${experience.companyName || "N/A"} - ${
        experience.jobTitle || "N/A"
      }</h4>
        <p>${experience.startDate || "N/A"} - ${experience.endDate || "N/A"}</p>
        <p>${experience.description || "N/A"}</p>
      `;
      container.appendChild(experienceDiv);
    });
  } else {
    container.textContent = `No ${title} provided.`;
  }
}

async function navBar(profileData) {
  const userProfileWrapper = document.querySelector(".user-profile-wrapper");
  const userNameElement = document.getElementById("loading-investor-name");

  try {
    if (userNameElement) {
      userNameElement.textContent = "Loading...";
    }

    const userData = profileData || (await loadCurrentUserData());

    if (userProfileWrapper) {
      const profileImage =
        userProfileWrapper.querySelector(".user-profile img");
      if (profileImage && userData.id) {
        const userImageSrc = `/assets/uploads/investor/${userData.id}/image.png`;
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

    const profileLink = document.querySelector(
      '.dropdown-menu a[href^="/investor-profile"]'
    );
    if (profileLink && userData.id) {
      profileLink.href = `/investor-profile?id=${userData.id}`;
      console.log("Profile link updated");
    } else {
      console.log("Profile link element not found or user ID is missing");
    }
  } catch (error) {
    console.error("Error updating navbar:", error);
    if (userNameElement) {
      userNameElement.textContent = "Error loading user data";
    }
  }
}

function addChangeProfileIcon(profileDataId, currentUserId) {
  const nameElement = document.getElementById("name");

  if (profileDataId === currentUserId && nameElement) {
    const existingIcon = nameElement.querySelector(".change-profile-icon");
    if (!existingIcon) {
      const changeProfileLink = document.createElement("a");
      changeProfileLink.href = `/investor-profile-change?id=${profileDataId}`;
      changeProfileLink.id = "change-profile-link";

      const changeProfileIcon = document.createElement("img");
      changeProfileIcon.src = "assets/icons/change-profile.png";
      changeProfileIcon.alt = "Change Profile";
      changeProfileIcon.className = "change-profile-icon";

      changeProfileLink.appendChild(changeProfileIcon);
      nameElement.appendChild(changeProfileLink);
    }
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

    window.location.replace("/login-investor");
  } catch (error) {
    handleError("Error during logout:", error);
  }
}

function showLoadingIndicator() {
  const loadingContainer = document.getElementById("loading-indicator");
  if (loadingContainer) loadingContainer.style.display = "block";
}

function hideLoadingIndicator() {
  const loadingContainer = document.getElementById("loading-indicator");
  if (loadingContainer) loadingContainer.style.display = "none";
}

function showError(message) {
  const errorMessageElement = document.getElementById("error-message");
  if (errorMessageElement) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = "block";
  }
}

function handleError(defaultMessage, error) {
  console.error(defaultMessage, error);
  showError(error.message || defaultMessage);
  alert("An error occurred: " + (error.message || defaultMessage));
}
