document.addEventListener("DOMContentLoaded", () => {
  loadUniversities();
  handleFormSubmission();
  togglePasswordVisibility();
});

const registrationForm = document.getElementById("registrationForm");
const showPasswordCheckbox = document.getElementById("show-password");
const passwordField = document.getElementById("password");

function loadUniversities() {
  fetch('/api/universities')
      .then(handleFetchResponse)
      .then(universities => {
          populateDropdown('university', universities);
      })
      .catch(handleError('Error fetching universities'));
}

function populateDropdown(dropdownId, data) {
  const selectElement = document.getElementById(dropdownId);
  data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.name; 
      option.text = item.name;
      selectElement.appendChild(option);
  });
}

function handleFormSubmission() {
  registrationForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = registrationForm.querySelector("#first-name").value;
      const middle = registrationForm.querySelector("#middle-initial").value;
      const surname = registrationForm.querySelector("#last-name").value;
      const age = registrationForm.querySelector("#age").value;
      const email = registrationForm.querySelector("#email-address").value;
      const password = passwordField.value;
      const confirmEmailAddress = document.getElementById("confirm-email-address").value;
      const livesOutsideUS = registrationForm.querySelector("#outside-us").checked;
      const educationPlace = registrationForm.querySelector("#university").value;
      const primaryDegree = registrationForm.querySelector("#primary-degree").value;

      if (!name || !surname || !age || !email || !educationPlace || !primaryDegree) {
          alert("Please fill in all required fields.");
          return;
      }

      if (email !== confirmEmailAddress) {
          alert("Email addresses do not match.");
          return;
      }

      const studentData = {
          name,
          surname,
          age: parseInt(age),
          middle: middle || null,
          primaryDegree,
          email,
          password,
          livesOutsideUS,
          educationPlace,
      };

      console.log("Sending student data:", studentData);

      fetch("/api/user", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
      })
          .then(handleFetchResponse)
          .then((data) => {
              alert("User added successfully");
              console.log("New user:", data);
              window.location.href = `profile?id=${data.id}`;
          })
          .catch(handleError('Registration failed. Please check your input.'));
  });
}

function togglePasswordVisibility() {
  showPasswordCheckbox.addEventListener("change", () => {
      passwordField.type = showPasswordCheckbox.checked ? "text" : "password";
  });
}

// Helper function to handle fetch responses
function handleFetchResponse(response) {
  if (!response.ok) {
      throw new Error('Network response was not ok');
  }
  return response.json();
}

// Helper function to create error handlers
function handleError(defaultMessage) {
  return (error) => {
      console.error(defaultMessage, error);
      alert(error.message || defaultMessage);
  };
}