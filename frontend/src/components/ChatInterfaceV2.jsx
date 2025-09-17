import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/api';
import Button from './Button_v2';
import AIResponseRenderer, { ExerciseRenderer } from './AIResponseRenderer';
import Alert from './Alert';
import Spinner from './Spinner';
import { 
  getCurrentChat,
  addMessageToCurrentChat, 
  saveToHistoryAndCreateNew,
  createNewChat,
  saveCurrentChat
} from '../utils/chatHistory';

const ChatInterfaceV2 = ({ 
  sessionId = null, 
  collectionId = null, 
  onSessionCreated = null,
  className = "",
  initialChatData = null,
  onMessageSaved = null
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const [selectedOperation, setSelectedOperation] = useState('summarize');
  const [selectedLanguage, setSelectedLanguage] = useState(user?.languagePref || 'english');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load chat data when initialChatData changes
  useEffect(() => {
    if (initialChatData) {
      // Convert localStorage format to UI format
      const convertedMessages = initialChatData.messages.map(msg => ({
        ...msg,
        type: msg.sender || msg.type, // Ensure type field exists
        content: msg.text || msg.content, // Ensure content field exists
        timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString() // Ensure string format
      }));
      setMessages(convertedMessages);
      setCurrentSessionId(initialChatData.id);
    } else {
      setMessages([]);
      setCurrentSessionId(null);
    }
  }, [initialChatData]);

  useEffect(() => {
    // No longer fetch from backend - we use localStorage exclusively
    // if (sessionId && !initialChatData) {
    //   fetchSessionMessages();
    // }
  }, [sessionId, initialChatData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Disabled: No longer using backend sessions, using localStorage instead
  // const fetchSessionMessages = async () => {
  //   try {
  //     const response = await sessionService.getSession(sessionId);
  //     if (response.data && response.data.messages) {
  //       const formattedMessages = response.data.messages.map(msg => ({
  //         id: msg.id,
  //         type: msg.is_user ? 'user' : 'ai',
  //         content: msg.content,
  //         timestamp: new Date(msg.created_at)
  //       }));
  //       setMessages(formattedMessages);
  //     }
  //   } catch (err) {
  //     setError('Failed to load session messages');
  //   }
  // };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setLoading(true);

    // Add user message to UI immediately
    const userMsgId = Date.now().toString();
    const newUserMessage = {
      id: userMsgId,
      type: 'user', // For UI rendering
      content: userMessage, // For UI rendering
      sender: 'user', // For localStorage compatibility
      text: userMessage, // For localStorage compatibility  
      timestamp: new Date().toISOString() // Consistent string format
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Add message to current chat (will create new chat if none exists)
      const updatedChat = addMessageToCurrentChat(newUserMessage);
      setCurrentSessionId(updatedChat.id);
      
      if (onSessionCreated && !currentSessionId) {
        onSessionCreated({ id: updatedChat.id });
      }
      
      if (onMessageSaved) {
        onMessageSaved(updatedChat);
      }

      // Call the selected AI endpoint
      let response;
      
      switch (selectedOperation) {
        case 'explain':
          response = await aiService.explain(userMessage, selectedLanguage);
          break;
        case 'generateExercises':
          response = await aiService.generateExercises(userMessage, selectedLanguage);
          break;
        default:
          response = await aiService.summarize(userMessage, selectedLanguage);
      }

      if (response) {
        // Handle different response types properly
        let content;
        let responseType = 'text';
        
        if (selectedOperation === 'generateExercises' && response.exercises) {
          content = response.exercises;
          responseType = 'exercises';
        } else {
          content = response.summary || response.explanation || response.result || 'Response received';
          responseType = 'text';
        }

        const aiMessage = {
          id: Date.now().toString() + '_ai',
          type: 'ai', // For UI rendering
          content: content, // For UI rendering
          responseType: responseType,
          sender: 'ai', // For localStorage compatibility
          text: content, // For localStorage compatibility
          timestamp: new Date().toISOString(), // Consistent string format
          aiOperation: selectedOperation
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Save AI response to current chat
        const updatedChatWithAI = addMessageToCurrentChat(aiMessage);
        
        if (onMessageSaved) {
          onMessageSaved(updatedChatWithAI);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send message');
      // Remove the user message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMsgId));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat? This will start a new session.')) {
      setMessages([]);
      setCurrentSessionId(null);
      setInput('');
      setError('');
      // Don't delete from localStorage, just start fresh
    }
  };

  const isRTL = user?.language_pref === 'arabic';

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Tutor</h3>
            {currentSessionId && (
              <p className="text-xs text-gray-500">Session {currentSessionId}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              title="Clear chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* AI Operation and Language Selection */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Operation
            </label>
            <select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="summarize">Summarize</option>
              <option value="explain">Explain</option>
              <option value="generateExercises">Generate Exercises</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="english">English</option>
              <option value="arabic">العربية</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')} className="m-4">
          {error}
        </Alert>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.83L3 21l1.83-6.226A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">
              Choose an AI operation above and enter your content. The AI will process your request and automatically create a session for you. 
              Sessions and collections are created automatically based on your interactions.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white rounded-lg rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-lg rounded-bl-none'
                } p-3 ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {message.type === 'ai' ? (
                  message.responseType === 'exercises' ? (
                    <ExerciseRenderer exercises={message.content} />
                  ) : (
                    <AIResponseRenderer content={message.content} />
                  )
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                <div className={`text-xs mt-2 opacity-70`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg rounded-bl-none p-3">
              <Spinner size="small" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={loading}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            loading={loading}
            className="shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
        
        <div className="flex items-center justify-end mt-2 text-xs text-gray-500">
          <span>Press Enter to send • Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterfaceV2;