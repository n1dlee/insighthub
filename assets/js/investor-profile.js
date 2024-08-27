document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const investorId = urlParams.get("id");

  console.log("investorId:", investorId);

  if (investorId) {
    loadProfile(investorId);
  } else {
    // rederict to the main page
    window.location.href = "/login";
  }

  const logoutLink = document.querySelector('.dropdown-menu a[href="/logout"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default link behavior
      logout();
    });
  }
});

function loadProfile(investorId) {
  const url = `/api/investor/${investorId}`;

  showLoadingIndicator();

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      hideLoadingIndicator();

      // Validate the expected fields before populating the data
      if (!data || typeof data !== "object") {
        throw new Error("Invalid profile data received");
      }

      // Update profile image (handle null or missing image)

      // Update investor name
      document.getElementById("name").textContent =
        `${data.name} ${data.surname}` || "N/A";

      // Update location (handle null or missing location)
      document.getElementById("location").textContent = data.location || "N/A";

      // Update bio (handle null or missing bio)
      document.getElementById("bio").textContent = data.bio || "N/A";

      // Update work history
      const workHistoryContainer = document.getElementById(
        "work-history-container"
      );
      workHistoryContainer.innerHTML = ""; // Clear previous content

      if (Array.isArray(data.workHistory) && data.workHistory.length > 0) {
        data.workHistory.forEach((experience) => {
          const experienceDiv = document.createElement("div");
          experienceDiv.innerHTML = `
                      <h4>${experience.companyName || "N/A"} - ${
            experience.jobTitle || "N/A"
          }</h4>
                      <p>${experience.startDate || "N/A"} - ${
            experience.endDate || "N/A"
          }</p>
                      <p>${experience.description || "N/A"}</p>
                  `;
          workHistoryContainer.appendChild(experienceDiv);
        });
      } else {
        workHistoryContainer.textContent = "No work history provided.";
      }
    })
    .catch((error) => {
      showError("An error occurred while loading the profile.");
      console.error("Error loading profile data:", error);
    });
}

function logout() {
  fetch("/api/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Include the token in the headers
    },
  })
    .then(handleFetchResponse)
    .then(() => {
      // Clear the token from local storage
      localStorage.removeItem("authToken");

      // Redirect to the login page
      window.location.href = "/login";
    })
    .catch((error) => {
      console.error("Error during logout:", error);
      // Handle the error gracefully (e.g., display an error message)
    });
}

// Helper function to handle fetch responses
function handleFetchResponse(response) {
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
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
  errorMessageElement.textContent = message;
  errorMessageElement.style.display = "block";
}
