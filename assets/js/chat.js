const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const chatMessages = document.querySelector(".chat-messages");
const contactsList = document.querySelector(".contacts-list");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const chatAvatar = document.getElementById("chat-avatar");
const chatWith = document.getElementById("chat-with");
const chatContainer = document.querySelector(".chat-container");

let currentConversationId = null;
let currentUser = null;

// Load and render the user's conversations
async function loadConversations() {
  try {
    const conversations = await window.chatService.getConversations();
    renderConversations(conversations);
  } catch (error) {
    console.warn("Error loading conversations:", error);
    renderConversations([]); // Render empty state
  }
}

// Render the list of conversations
function renderConversations(conversations) {
  contactsList.innerHTML = "";

  if (conversations.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.textContent = "No conversations yet";
    emptyState.classList.add("empty-state");
    contactsList.appendChild(emptyState);
  } else {
    conversations.forEach((conversation) => {
      const otherParticipant =
        conversation.participant1.id === currentUser.id
          ? conversation.participant2
          : conversation.participant1;
      const contactItem = createContactItem(otherParticipant, () =>
        loadConversation(conversation.id)
      );
      contactsList.appendChild(contactItem);
    });
  }
}

// Create a contact item element
function createContactItem(user, onClick) {
  const contactItem = document.createElement("li");
  contactItem.classList.add("contact-item");
  const userImageSrc = `assets/uploads/${user.id}/image.png`;
  contactItem.innerHTML = `
    <img class="contact-avatar" src="${userImageSrc}" alt="${user.name} ${user.surname}" onerror="this.src='assets/icons/default-avatar.png';">
    <div class="contact-name">${user.name} ${user.surname}</div>
  `;
  contactItem.addEventListener("click", onClick);
  return contactItem;
}

// Load and render the messages for a specific conversation
async function loadConversation(conversationId) {
  try {
    currentConversationId = conversationId;
    const conversation = await window.chatService.getConversation(
      conversationId
    );
    renderMessages(conversation.chats);
    updateChatHeader(conversation);
    showChatContainer();
  } catch (error) {
    console.warn("Error loading conversation:", error);
    showEmptyChatState();
  }
}

// Update the chat header with the current conversation participant
function updateChatHeader(conversation) {
  const otherParticipant =
    conversation.participant1.id === currentUser.id
      ? conversation.participant2
      : conversation.participant1;
  const userImageSrc = `assets/uploads/${otherParticipant.id}/image.png`;
  chatAvatar.src = userImageSrc;
  chatAvatar.onerror = () => {
    chatAvatar.src = "assets/icons/default-avatar.png";
  };
  chatWith.textContent = `${otherParticipant.name} ${otherParticipant.surname}`;
}

// Show the chat container
function showChatContainer() {
  chatContainer.style.display = "block";
  const placeholderElement = document.querySelector(".chat-placeholder");
  if (placeholderElement) {
    placeholderElement.style.display = "none";
  }
}

function showEmptyChatState() {
  chatContainer.style.display = "block";
  chatMessages.innerHTML = "<div class='empty-chat'>No messages yet</div>";
  chatWith.textContent = "New Conversation";
  chatAvatar.src = "assets/icons/default-avatar.png";
}

// Render the messages in the chat window
function renderMessages(messages) {
  chatMessages.innerHTML = "";

  if (messages.length === 0) {
    chatMessages.innerHTML = "<div class='empty-chat'>No messages yet</div>";
  } else {
    messages.forEach((message) => {
      const messageElement = document.createElement("div");
      messageElement.classList.add(
        "message",
        message.senderId === currentUser.id ? "sent" : "received"
      );
      messageElement.innerHTML = `
        <div class="message-content">${message.content}</div>
      `;
      chatMessages.appendChild(messageElement);
    });
  }

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
      console.warn("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  }
}

// Search for users
async function searchUsers(query) {
  try {
    const users = await window.chatService.searchUsers(query);
    renderSearchResults(users);
  } catch (error) {
    console.warn("Error searching users:", error);
    renderSearchResults([]);
  }
}

// Render search results
function renderSearchResults(users) {
  searchResults.innerHTML = "";
  if (users.length === 0) {
    const noResults = document.createElement("div");
    noResults.textContent = "No users found";
    noResults.classList.add("no-results");
    searchResults.appendChild(noResults);
  } else {
    users.forEach((user) => {
      const resultItem = createContactItem(user, () =>
        startOrLoadConversation(user)
      );
      searchResults.appendChild(resultItem);
    });
  }
  searchResults.style.display = "block";
}

// Start a new conversation or load an existing one with a user
async function startOrLoadConversation(user) {
  try {
    const conversations = await window.chatService.getConversations();
    const existingConversation = conversations.find(
      (conv) =>
        conv.participant1.id === user.id || conv.participant2.id === user.id
    );

    if (existingConversation) {
      loadConversation(existingConversation.id);
    } else {
      const conversation = await window.chatService.startConversation(user.id);
      currentConversationId = conversation.id;
      loadConversation(conversation.id);
    }

    searchResults.style.display = "none";
    searchInput.value = "";
  } catch (error) {
    console.warn("Error starting/loading conversation:", error);
    showEmptyChatState();
  }
}

// Load current user data
async function loadCurrentUserData() {
  try {
    const response = await fetch("/api/auth-student", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? "Unauthorized. Please log in."
          : "Network response was not ok."
      );
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

    currentUser = await loadCurrentUserData();

    if (userProfileWrapper) {
      const profileImage =
        userProfileWrapper.querySelector(".user-profile img");
      if (profileImage && currentUser.id) {
        const userImageSrc = `assets/uploads/${currentUser.id}/image.png`;
        profileImage.src = userImageSrc;
        profileImage.onerror = () => {
          console.warn("Failed to load user profile image. Using default.");
          profileImage.src = "assets/icons/default-image.png";
        };
      }
    }

    if (userNameElement && currentUser) {
      userNameElement.textContent =
        `${currentUser.name || ""} ${currentUser.surname || ""}`.trim() ||
        "N/A";
    }

    const profileLink = document.querySelector('a[href="/profile"]');
    if (profileLink && currentUser && currentUser.id) {
      profileLink.href = `/profile?id=${currentUser.id}`;
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

function attachEventListeners() {
  const logoutLink = document.querySelector('.dropdown-menu a[href="/logout"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
    });
  }

  sendButton.addEventListener("click", sendMessage);

  messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    if (query.length >= 2) {
      searchUsers(query);
    } else {
      searchResults.style.display = "none";
    }
  });
}

// Initialize the chat application
async function initChat() {
  try {
    await updateIconBar();
    await loadConversations();
    attachEventListeners();
  } catch (error) {
    console.warn("Error initializing chat:", error);
    showEmptyChatState();
  }
}

// Run initialization when the window loads
window.addEventListener("load", initChat);
