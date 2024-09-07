document.addEventListener("DOMContentLoaded", async () => {
  const profileEditForm = document.getElementById("profileEditForm");

  // Extract userId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");

  await updateIconBar();
  attachEventListeners();

  console.log("Profile Edit page loaded. User ID from URL:", userId);

  if (!userId) {
    console.error("User ID not found in URL. Redirecting...");
    window.location.href = "/login-investor";
    return;
  }

  try {
    // Fetch initial user data (logged-in user)
    const currentUserData = await loadCurrentUserData();
    console.log(
      "Current user data (from /api/auth-investor):",
      currentUserData
    );

    if (!currentUserData || !currentUserData.id) {
      throw new Error("Invalid user data received from server");
    }

    // Populate read-only fields for the logged-in user
    const readOnlyFields = ["name", "surname", "education"];
    populateFormFields(profileEditForm, currentUserData, readOnlyFields);
    loadMajors();

    // Fetch additional profile data if editing another user's profile
    if (userId !== currentUserData.id) {
      const profileData = await loadProfileData(userId);
      console.log("Fetched profile data for editing:", profileData);

      // Populate editable fields for the user being edited
      const editableFields = [
        "location",
        "major",
        "gpa",
        "sat",
        "ielts",
        "achievements",
        "bio",
      ];
      populateFormFields(profileEditForm, profileData, editableFields);
    }

    if (currentUserData.profileImage) {
      const img = document.createElement("img");
      img.src = currentUserData.profileImage;
      img.alt = "Current Profile Image";
      profileImageInput.parentNode.insertBefore(img, profileImageInput);
    }
  } catch (error) {
    handleError("Error loading profile data:", error);
  }

  function attachEventListeners() {
    // Attach logout functionality (if applicable on this page)
    const logoutLink = document.querySelector(
      '.dropdown-menu a[href="/logout"]'
    );
    if (logoutLink) {
      logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
      });
    }
  }

  // Handle form submission
  profileEditForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(profileEditForm);
    const updatedFields = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "id" && value !== "") {
        updatedFields[key] = value;
      }
    }

    formData.append("id", userId); // Include the user ID

    try {
      const response = await fetch(`/api/investor/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updatedFields),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Profile updated successfully");
        window.location.href = `investor-profile?id=${userId}`;
      } else {
        const errorText = await response.text();
        console.error("Failed to update profile:", errorText);
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  });

  async function loadProfileData(userId) {
    try {
      const endpoint = userId
        ? `/api/investor/${userId}`
        : "/api/auth-investor";
      console.log("Fetching profile data from:", endpoint);

      const response = await fetch(endpoint, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Error response from",
          endpoint,
          ":",
          response.status,
          errorText
        );
        throw new Error(
          `Network response was not ok. Status: ${response.status}`
        );
      }

      const profileData = await response.json();
      if (!profileData || !profileData.id) {
        console.error(
          "Invalid profile data received from server:",
          profileData
        );
        throw new Error("No profile data or ID found.");
      }

      return profileData;
    } catch (error) {
      console.error("Error loading profile data:", error);
      throw error;
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

      return userData;
    } catch (error) {
      console.error("Error checking authentication:", error);
      window.location.replace("/login-investor");
    }
  }

  function populateFormFields(form, data, fieldsToPopulate) {
    fieldsToPopulate.forEach((key) => {
      const field = form.querySelector(`#${key}`);
      if (!field) {
        console.warn(`Field with ID '${key}' not found in the form.`);
        return;
      }

      if (field.tagName.toLowerCase() === "span") {
        field.textContent = data[key] || "";
      } else {
        field.value = data[key] || "";
      }

      if (["name", "surname", "education"].includes(key)) {
        field.readOnly = true;
      }
    });

    const nameField = form.querySelector("#name");
    const surnameField = form.querySelector("#surname");
    const educationField = form.querySelector("#education");
    if (nameField && surnameField && educationField) {
      nameField.textContent = data.name || "N/A";
      surnameField.textContent = data.surname || "N/A";
      educationField.textContent = data.educationPlace || "N/A";
    }
  }

  function loadMajors() {
    fetch("/api/majors")
      .then(handleFetchResponse)
      .then((majors) => {
        populateDropdown("major", majors);
      })
      .catch((error) => {
        handleError("Error fetching majors", error);
      });
  }

  function populateDropdown(dropdownId, items) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
      console.warn(`Dropdown with ID '${dropdownId}' not found.`);
      return;
    }
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      dropdown.appendChild(option);
    });
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

      navBar(userData);
    } catch (error) {
      console.error("Error fetching user details:", error);
      if (userNameElement) {
        userNameElement.textContent = "Error loading user data";
      }
    }
  }

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
      navbarUserName.textContent =
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
  }

  async function logout() {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/login";
      } else {
        throw new Error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert(error.message);
    }
  }

  function handleError(message, error) {
    console.error(message, error);
    alert(error?.message || message);
  }

  function handleFetchResponse(response) {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  }
});
