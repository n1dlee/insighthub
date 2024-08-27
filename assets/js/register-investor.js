document.addEventListener("DOMContentLoaded", () => {
  // No need to load universities for investors
  handleFormSubmission();
  togglePasswordVisibility();
});

const registrationForm = document.getElementById("registrationForm");
const showPasswordCheckbox = document.getElementById("show-password");
const passwordField = document.getElementById("password");

function handleFormSubmission() {
  registrationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = registrationForm.querySelector("#first-name").value;
    const middle = registrationForm.querySelector("#middle-initial").value;
    const surname = registrationForm.querySelector("#last-name").value;
    const age = registrationForm.querySelector("#age").value;
    const email = registrationForm.querySelector("#email-address").value;
    const password = passwordField.value;
    const confirmEmailAddress = document.getElementById(
      "confirm-email-address"
    ).value;
    const livesOutsideUS =
      registrationForm.querySelector("#outside-us").checked;
    const workPlace = registrationForm.querySelector("#workplace").value; // Assuming you have this field for investors
    const companyName = registrationForm.querySelector("#company-name").value; // Assuming this is optional
    const jobFunc = registrationForm.querySelector(
      "#primary-job-function"
    ).value; // Assuming you have this field

    // Basic validation
    if (!name || !surname || !age || !email || !workPlace || !jobFunc) {
      alert("Please fill in all required fields.");
      return;
    }

    if (email !== confirmEmailAddress) {
      alert("Email addresses do not match.");
      return;
    }

    const investorData = {
      name,
      surname,
      age: parseInt(age),
      middle: middle || null,
      email,
      password,
      livesOutsideUS,
      workPlace,
      companyName: companyName || null,
      jobFunc,
    };

    console.log("Sending investor data:", investorData);

    fetch("/api/investor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(investorData),
    })
      .then(handleFetchResponse)
      .then((data) => {
        alert("Investor added successfully");
        console.log("New investor:", data);
        // Redirect to investor profile page (adjust as needed)
        window.location.href = `investor-profile?id=${data.id}`;
      })
      .catch(handleError("Registration failed. Please check your input."));
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
    throw new Error("Network response was not ok");
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
