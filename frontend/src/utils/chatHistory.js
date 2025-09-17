// Simple chat history management using localStorage
// No backend sessions needed - everything stored locally

const CHAT_HISTORY_KEY = 'ai_tutor_chat_history';
const CURRENT_CHAT_KEY = 'ai_tutor_current_chat';

// Generate a simple chat title from the first message
function generateChatTitle(firstMessage) {
  if (!firstMessage) return 'New Chat';
  
  // Take first 40 characters and add "..." if longer
  const title = firstMessage.length > 40 
    ? firstMessage.substring(0, 40) + '...' 
    : firstMessage;
  
  return title;
}

// Get all chat history from localStorage
export function getChatHistory() {
  try {
    const history = localStorage.getItem(CHAT_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
}

// Get current active chat
export function getCurrentChat() {
  try {
    const currentChat = localStorage.getItem(CURRENT_CHAT_KEY);
    return currentChat ? JSON.parse(currentChat) : null;
  } catch (error) {
    console.error('Error loading current chat:', error);
    return null;
  }
}

// Save current chat to localStorage
export function saveCurrentChat(chatData) {
  try {
    localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(chatData));
  } catch (error) {
    console.error('Error saving current chat:', error);
  }
}

// Create a new chat session
export function createNewChat() {
  const newChat = {
    id: Date.now().toString(), // Simple ID based on timestamp
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveCurrentChat(newChat);
  return newChat;
}

// Add a message to current chat or create new chat
export function addMessageToCurrentChat(message) {
  let currentChat = getCurrentChat();
  
  // If no current chat exists, create a new one
  if (!currentChat) {
    currentChat = createNewChat();
  }
  
  // Add the new message
  currentChat.messages.push({
    ...message,
    timestamp: new Date().toISOString()
  });
  
  // Update the chat title if this is the first user message
  if (currentChat.messages.length === 1 && (message.sender === 'user' || message.type === 'user')) {
    const messageText = message.text || message.content;
    currentChat.title = generateChatTitle(messageText);
  }
  
  // Update timestamp
  currentChat.updatedAt = new Date().toISOString();
  
  // Save the updated chat as current
  saveCurrentChat(currentChat);
  
  // Also save to history immediately
  saveToHistory(currentChat);
  
  return currentChat;
}

// Save a chat to history (updates existing or adds new)
function saveToHistory(chat) {
  const history = getChatHistory();
  
  // Check if this chat already exists in history
  const existingIndex = history.findIndex(c => c.id === chat.id);
  
  if (existingIndex !== -1) {
    // Update existing chat
    history[existingIndex] = { ...chat };
  } else {
    // Add new chat at the beginning
    history.unshift(chat);
  }
  
  // Keep only last 50 chats
  const trimmedHistory = history.slice(0, 50);
  
  // Save updated history
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving chat to history:', error);
  }
}

// Save current chat to history and start a new one
export function saveToHistoryAndCreateNew() {
  const currentChat = getCurrentChat();
  
  if (!currentChat || currentChat.messages.length === 0) {
    return createNewChat();
  }
  
  // Get existing history
  const history = getChatHistory();
  
  // Add current chat to history (at the beginning for newest first)
  const updatedHistory = [currentChat, ...history];
  
  // Keep only last 50 chats to prevent localStorage from getting too large
  const trimmedHistory = updatedHistory.slice(0, 50);
  
  // Save updated history
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
  
  // Create and return new chat
  return createNewChat();
}

// Load a specific chat from history
export function loadChatFromHistory(chatId) {
  const history = getChatHistory();
  const chat = history.find(c => c.id === chatId);
  
  if (chat) {
    // Make a copy and set as current chat
    const chatCopy = { ...chat };
    saveCurrentChat(chatCopy);
    return chatCopy;
  }
  
  return null;
}

// Delete a chat from history
export function deleteChatFromHistory(chatId) {
  const history = getChatHistory();
  const updatedHistory = history.filter(c => c.id !== chatId);
  
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error deleting chat from history:', error);
    return false;
  }
}

// Format date for display
export function formatChatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Clear all chat history (for settings/cleanup)
export function clearAllChatHistory() {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(CURRENT_CHAT_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return false;
  }
}