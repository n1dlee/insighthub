class ChatService {
  constructor() {
    this.baseUrl = "/api/chat";
  }

  // Send a message to an existing conversation
  async sendMessage(conversationId, content) {
    return this._fetchWithErrorHandling(
      this.baseUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationId, content }),
      },
      "send message"
    );
  }

  // Fetch a specific conversation by ID
  async getConversation(conversationId) {
    return this._fetchWithErrorHandling(
      `${this.baseUrl}/${conversationId}`,
      {},
      "fetch conversation"
    );
  }

  // Fetch all conversations for the logged-in user
  async getConversations() {
    return this._fetchWithErrorHandling(
      `${this.baseUrl}/conversations`,
      {},
      "fetch conversations"
    );
  }

  // Start a new conversation with a specific participant
  async startConversation(participantId) {
    return this._fetchWithErrorHandling(
      `${this.baseUrl}/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId }),
      },
      "start conversation"
    );
  }

  async getAllUsers() {
    return this._fetchWithErrorHandling(`api/users`, {}, "get all users");
  }

  async searchUsers(query) {
    const allUsers = await this.getAllUsers();
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.surname.toLowerCase().includes(query.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(query.toLowerCase()))
    );
  }

  async _fetchWithErrorHandling(url, options, action) {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: "include", // Send credentials (cookies, etc.) with the request
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Error response body: ${errorBody}`);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
      }

      return await response.json(); // Return the parsed JSON response
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      throw new Error(`Failed to ${action}: ${error.message}`);
    }
  }
}

// Expose the ChatService globally so it can be used in other parts of the app
window.chatService = new ChatService();
