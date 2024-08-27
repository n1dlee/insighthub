document.addEventListener("DOMContentLoaded", async () => {
  const profileEditForm = document.getElementById("profileEditForm");

  // Extract userId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");

  console.log("Profile Edit page loaded. User ID from URL:", userId);

  if (!userId) {
      console.error("User ID not found in URL. Redirecting...");
      window.location.href = "/login-student";
      return;
  }

  try {
      // Fetch initial user data (logged-in user)
      const currentUserData = await loadProfileData();
      console.log("Current user data (from /api/auth):", currentUserData);

      if (!currentUserData || !currentUserData.id) {
          throw new Error("Invalid user data received from server");
      }

      // Populate read-only fields for the logged-in user
      const readOnlyFields = ["name", "surname", "education"];
      populateFormFields(profileEditForm, currentUserData, readOnlyFields);

      // Load majors and populate dropdown
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
          ];
          populateFormFields(profileEditForm, profileData, editableFields);
      }

      // Set the initial profile image (if available)
      const profileImageInput = document.getElementById("profileImage");
      if (currentUserData.profileImage) {
          const img = document.createElement('img');
          img.src = currentUserData.profileImage;
          img.alt = 'Current Profile Image';
          profileImageInput.parentNode.insertBefore(img, profileImageInput); // Add image before the input
      }
  } catch (error) {
      handleError("Error loading profile data:", error);
  }

  // Handle form submission
  profileEditForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(profileEditForm);

      // Convert empty strings to null for integer fields (if needed)
      const gpa = profileEditForm.querySelector("#gpa").value.trim();
      formData.set("gpa", gpa === "" ? null : gpa);

      const sat = profileEditForm.querySelector("#sat").value.trim();
      formData.set("sat", sat === "" ? null : sat);

      const ielts = profileEditForm.querySelector("#ielts").value.trim();
      formData.set("ielts", ielts === "" ? null : ielts);

      formData.append("id", userId); // Include the user ID

      try {
          const response = await fetch(`/api/user/${userId}`, {
              method: "PUT",
              body: formData,
          });

          if (response.ok) {
              alert("Profile updated successfully");
              window.location.href = `profile?id=${userId}`;
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
      const endpoint = userId ? `/api/user/${userId}` : "/api/auth-student"; // Adjusted for profile editing
      console.log("Fetching profile data from:", endpoint); // Debugging

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

  function populateFormFields(form, data, fieldsToPopulate) {
    const readOnlyFields = ["name", "surname", "education"];

    for (const key of fieldsToPopulate) {
      const field = form.querySelector(`#${key}`);

      if (!field) {
        console.warn(`Field with ID '${key}' not found in the form.`);
        continue;
      }

      // Проверяем тип элемента и устанавливаем значение соответствующим образом
      if (field.tagName.toLowerCase() === "span") {
        field.textContent = data[key] ?? "";
      } else {
        field.value = data[key] ?? "";
      }

      if (readOnlyFields.includes(key)) {
        if (field.tagName.toLowerCase() === "span") {
          field.contentEditable = false;
        } else {
          field.readOnly = true;
        }
      }
    }

    // Дополнительно, если нужно заполнить h1 для имени и фамилии:
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
    if (dropdown) {
      items.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        dropdown.appendChild(option);
      });
    } else {
      console.warn(`Dropdown with ID '${dropdownId}' not found.`);
    }
  }

  function handleError(message, error) {
    console.error(message, error);
    alert(error?.message || message); // Display a user-friendly error message
  }

  function handleFetchResponse(response) {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  }
});
