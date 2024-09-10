// chat.js

// Get references to DOM elements
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const chatMessages = document.querySelector(".chat-messages");
const contactsList = document.querySelector(".contacts-list");

let currentConversationId = null;

// Load and render the user's conversations
async function loadConversations() {
  try {
    const conversations = await window.chatService.getConversations();
    renderConversations(conversations);
  } catch (error) {
    handleError("Error loading conversations:", error);
  }
}

// Render the list of conversations
function renderConversations(conversations) {
  contactsList.innerHTML = "";

  conversations.forEach((conversation) => {
    const otherParticipant = conversation.participant1.id === currentUser.id ? conversation.participant2 : conversation.participant1;
    const contactItem = document.createElement("li");
    contactItem.classList.add("contact-item");
    contactItem.innerHTML = `
      <img class="contact-avatar" src="${otherParticipant.profile_image || "/assets/icons/default-image.png"}" alt="${otherParticipant.name} ${otherParticipant.surname}">
      <div class="contact-name">${otherParticipant.name} ${otherParticipant.surname}</div>
    `;
    contactItem.addEventListener("click", () => loadConversation(conversation.id));
    contactsList.appendChild(contactItem);
  });
}

// Load and render the messages for a specific conversation
async function loadConversation(conversationId) {
  try {
    currentConversationId = conversationId;
    const conversation = await window.chatService.getConversation(conversationId);
    renderMessages(conversation.chats);
  } catch (error) {
    handleError("Error loading conversation:", error);
  }
}

// Render the messages in the chat window
function renderMessages(messages) {
  chatMessages.innerHTML = "";

  messages.forEach((message) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", message.senderId === currentUser.id ? "sent" : "received");
    messageElement.innerHTML = `
      <div class="message-content">${message.content}</div>
    `;
    chatMessages.appendChild(messageElement);
  });

  // Scroll to the bottom of the chat window
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle sending a new message
async function sendMessage() {
  const message = messageInput.value.trim();
  if (message && currentConversationId) {
    try {
      await window.chatService.sendMessage(currentConversationId, message);
      messageInput.value = "";
      // Refresh the conversation to display the new message
      loadConversation(currentConversationId);
    } catch (error) {
      handleError("Error sending message:", error);
    }
  }
}

// Attach event listener to send button
sendButton.addEventListener("click", sendMessage);

// Allow sending message with Enter key
messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

// Load current user data
async function loadCurrentUserData() {
  try {
    const response = await fetch("/api/auth-student", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(response.status === 401 ? "Unauthorized. Please log in." : "Network response was not ok.");
    }

    const userData = await response.json();
    if (!userData || !userData.id) {
      throw new Error("No user data or ID found.");
    }

    const userResponse = await fetch(`/api/user/${userData.id}`);
    if (!userResponse.ok) {
      throw new Error("Failed to fetch additional user data.");
    }

    const additionalUserData = await userResponse.json();
    return { ...userData, ...additionalUserData };
  } catch (error) {
    handleError("Error checking authentication:", error);
    window.location.replace("/login-student");
  }
}

// Update the icon bar with user information
async function updateIconBar() {
  const userProfileWrapper = document.querySelector(".user-profile-wrapper");
  const userNameElement = document.getElementById("loading-student-name");

  try {
    if (userNameElement) {
      userNameElement.textContent = "Loading...";
    }

    const userData = await loadCurrentUserData();
    window.currentUser = userData; // Store current user data globally

    if (userProfileWrapper) {
      const profileImage = userProfileWrapper.querySelector(".user-profile img");
      if (profileImage && userData.id) {
        const userImageSrc = `assets/uploads/${userData.id}/image.png`;
        profileImage.src = userImageSrc;
        profileImage.onerror = () => {
          console.warn("Failed to load user profile image. Using default.");
          profileImage.src = "assets/icons/default-image.png";
        };
      }
    }

    if (userNameElement && userData) {
      userNameElement.textContent = `${userData.name || ""} ${userData.surname || ""}`.trim() || "N/A";
    }

    const profileLink = document.querySelector('a[href="/profile"]');
    if (profileLink && userData && userData.id) {
      profileLink.href = `/profile?id=${userData.id}`;
    }
  } catch (error) {
    handleError("Error updating icon bar:", error);
    if (userNameElement) {
      userNameElement.textContent = "Error loading user data";
    }
  }
}

// Helper function to handle errors
function handleError(message, error) {
  console.error(message, error);
  // You can add more error handling here, such as displaying an error message to the user
}

// Function to handle logout
async function logout() {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Logout failed");
    }
    window.location.href = "/login";
  } catch (error) {
    handleError("Error during logout:", error);
  }
}

// Attach event listeners
function attachEventListeners() {
  const logoutLink = document.querySelector('.dropdown-menu a[href="/logout"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
    });
  }
}

// Initialize the chat application
async function initChat() {
  try {
    await updateIconBar();
    await loadConversations();
    attachEventListeners();
  } catch (error) {
    handleError("Error initializing chat:", error);
  }
}

// Run initialization when the window loads
window.addEventListener("load", initChat);