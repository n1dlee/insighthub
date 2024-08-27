const loginForm = document.getElementById("loginForm");
const passwordField = document.getElementById("password");
const showPasswordCheckbox = document.getElementById("show-password");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = loginForm.querySelector("#email-address").value;
  const password = passwordField.value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  const loginData = {
    email: email,
    password: password,
  };

  console.log("Sending login data:", loginData);

  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  })
    .then((response) => {
      // Check if the response is ok
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the response as JSON
    })
    .then((data) => {
      alert("Login successful");
      console.log("Logged in user:", data);
      window.location.href = `profile?id=${data.id}`;
    })
    .catch((error) => {
      handleError("Error during login or redirect:", error);
    });
});

// Toggle password visibility with checkbox
showPasswordCheckbox.addEventListener("change", () => {
  passwordField.type = showPasswordCheckbox.checked ? "text" : "password";
});

function handleError(message, error) {
  console.error(message, error);
  alert(error.message || message);
}
