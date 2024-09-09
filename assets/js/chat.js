const ChatModel = require("./models/chat.model");
const ConversationModel = require("./models/conversation.model");
const UserModel = require("./models/user.model");
const chatController = require("./controller/chat.controller");

// Get references to DOM elements
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const chatMessages = document.querySelector(".chat-messages");
const contactsList = document.querySelector(".contacts-list");

// Load and render the user's conversations
async function loadConversations() {
  try {
    const conversations = await chatController.getConversations();
    renderConversations(conversations);
  } catch (error) {
    console.error("Error loading conversations:", error);
    // Handle error, e.g., display a message to the user
  }
}

// Render the list of conversations
function renderConversations(conversations) {
  contactsList.innerHTML = "";

  conversations.forEach((conversation) => {
    const contactItem = document.createElement("li");
    contactItem.classList.add("contact-item");
    contactItem.innerHTML = `
        <img class="contact-avatar" src="${
          conversation.participant1.profile_image ||
          "/assets/icons/default-image.png"
        }" alt="${conversation.participant1.name} ${
      conversation.participant1.surname
    }">
        <div class="contact-name">${conversation.participant1.name} ${
      conversation.participant1.surname
    }</div>
      `;
    contactItem.addEventListener("click", () => {
      navigateToProfile(conversation.participant1.id);
    });
    contactsList.appendChild(contactItem);
  });
}

// Function to handle navigation to the profile page
function navigateToProfile(userId) {
  if (userId) {
    window.location.href = `/profile?id=${userId}`;
  } else {
    console.error("User ID is missing. Unable to navigate to profile.");
  }
}

// Load and render the messages for a specific conversation
async function loadConversation(conversationId) {
  try {
    const conversation = await chatController.getConversation(conversationId);
    renderMessages(conversation.chats);
  } catch (error) {
    console.error("Error loading conversation:", error);
    // Handle error, e.g., display a message to the user
  }
}

// Render the messages in the chat window
function renderMessages(messages) {
  chatMessages.innerHTML = "";

  messages.forEach((message) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add(
      "message",
      message.senderId === req.user.id ? "sent" : "received"
    );
    messageElement.innerHTML = `
      <div class="message-content">${message.content}</div>
    `;
    chatMessages.appendChild(messageElement);
  });

  // Scroll to the bottom of the chat window
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle sending a new message
sendButton.addEventListener("click", async () => {
  const message = messageInput.value.trim();
  if (message) {
    try {
      await chatController.sendMessage({ conversationId, content: message });
      messageInput.value = "";
      // Refresh the conversation to display the new message
      loadConversation(conversationId);
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error, e.g., display a message to the user
    }
  }
});

async function navBar() {
  const navbarUserName = document.getElementById("navbar-user-name");
  const navbarUserAvatar = document.getElementById("navbar-user-avatar");
  const profileLink = document.querySelector('a[href="/profile"]');

  try {
    const userData = await loadCurrentUserData();

    if (navbarUserName) {
      navbarUserName.textContent = `${userData.name || "N/A"} ${
        userData.surname || "N/A"
      }`;
    }

    if (navbarUserAvatar && userData.id) {
      const userAvatarSrc = `assets/uploads/${userData.id}/image.png`;
      navbarUserAvatar.src = userAvatarSrc;

      navbarUserAvatar.onerror = () => {
        console.error("Failed to load user avatar. Using default.");
        navbarUserAvatar.src = "assets/icons/default-image.png";
      };
    }

    if (profileLink && userData.id) {
      profileLink.href = `/profile?id=${userData.id}`;
      profileLink.addEventListener("click", (event) => {
        event.preventDefault();
        navigateToProfile(userData.id);
      });
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    if (navbarUserName) {
      navbarUserName.textContent = "Error loading user data";
    }
  }
}

window.addEventListener("load", async () => {
  await loadConversations();
  await navBar();
});
