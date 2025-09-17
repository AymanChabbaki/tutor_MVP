import React, { useState, useEffect } from 'react';
import Button from './Button_v2';
import Spinner from './Spinner';
import {
  getChatHistory,
  loadChatFromHistory,
  formatChatDate,
  deleteChatFromHistory,
  clearAllChatHistory
} from '../utils/chatHistory';

const Sidebar = ({ isOpen, setIsOpen, currentSessionId, setCurrentSessionId, onChatLoad, refreshTrigger }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  // Reload history when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      loadChatHistory();
    }
  }, [refreshTrigger]);

  const loadChatHistory = () => {
    setLoading(true);
    setError(null);
    try {
      const history = getChatHistory();
      setChatHistory(history);
    } catch (err) {
      setError('Failed to load chat history');
      console.error('Chat history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chat) => {
    try {
      const chatData = loadChatFromHistory(chat.id);
      if (chatData && onChatLoad) {
        setCurrentSessionId(chat.id);
        onChatLoad(chatData);
        // Close sidebar on mobile after selection
        if (window.innerWidth < 1024) {
          setIsOpen(false);
        }
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
      setError('Failed to load selected chat');
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    if (onChatLoad) {
      onChatLoad(null); // Clear current chat
    }
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChatFromHistory(chatId);
      loadChatHistory(); // Refresh the display
      // If we're deleting the current chat, clear it
      if (currentSessionId === chatId) {
        setCurrentSessionId(null);
        if (onChatLoad) {
          onChatLoad(null);
        }
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
              <div className="flex items-center space-x-2">
                <Button
                  size="small"
                  variant="outline"
                  onClick={handleNewChat}
                  title="Start new chat"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Button>
                <button
                  className="lg:hidden p-1 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner size="medium" />
              </div>
            ) : error ? (
              <div className="p-4">
                <div className="text-center text-red-600 text-sm">
                  {error}
                </div>
                <Button
                  size="small"
                  variant="outline"
                  onClick={loadChatHistory}
                  className="mt-2 w-full"
                >
                  Try Again
                </Button>
              </div>
            ) : chatHistory.length > 0 ? (
              <div className="p-2">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-colors mb-2 group relative
                      ${currentSessionId === chat.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50 border border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatChatDate(chat.updatedAt)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                        title="Delete chat"
                      >
                        <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <svg 
                  className="mx-auto h-12 w-12 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.83L3 21l1.83-6.226A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" 
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start a new chat to begin your learning journey
                </p>
                <Button
                  size="small"
                  variant="outline"
                  onClick={handleNewChat}
                  className="mt-4"
                >
                  Start New Chat
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Your chat history
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;