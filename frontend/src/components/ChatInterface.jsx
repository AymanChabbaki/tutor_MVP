import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Menu, Sparkles, FileText, BookOpen, Dumbbell } from 'lucide-react';
import MessageBubble from './MessageBubble';
import InputArea from './InputArea';
import ChatSidebar from './ChatSidebar';
import Button from './Button';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewConversation = () => {
    const newConversationId = Date.now().toString();
    const newConversation = {
      id: newConversationId,
      title: "New Chat",
      messages: [],
      timestamp: new Date().toISOString()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversationId);
    setMessages([]);
    return newConversationId;
  };

  const switchConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      setSidebarOpen(false);
    }
  };

  const updateConversationTitle = (conversationId, title) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, title: title.substring(0, 50) + (title.length > 50 ? '...' : '') }
          : conv
      )
    );
  };

  const saveMessageToConversation = (newMessages) => {
    if (currentConversationId) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId 
            ? { ...conv, messages: newMessages }
            : conv
        )
      );
    }
  };

  const addMessage = (message) => {
    const newMessages = [...messages, message];
    setMessages(newMessages);
    saveMessageToConversation(newMessages);
    
    // Update conversation title if it's the first user message
    if (message.type === 'user' && messages.length === 0 && currentConversationId) {
      const title = message.content.substring(0, 50);
      updateConversationTitle(currentConversationId, title);
    }
  };

  const handleSubmit = async (content, actionType, language) => {
    if (!content.trim()) return;

    // Create new conversation if none exists
    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = createNewConversation();
    }

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      actionType,
      language,
      timestamp: new Date().toISOString()
    };
    
    addMessage(userMessage);
    setIsLoading(true);

    try {
      let response;
      const apiUrl = 'http://localhost:5000/api';
      
      // Call appropriate API endpoint
      switch (actionType) {
        case 'summary':
          response = await fetch(`${apiUrl}/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: content, language_preference: language })
          });
          break;
        case 'explanation':
          response = await fetch(`${apiUrl}/explain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: content, language_preference: language })
          });
          break;
        case 'exercises':
          response = await fetch(`${apiUrl}/generate_exercises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: content, language_preference: language })
          });
          break;
        default:
          throw new Error('Invalid action type');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data,
        actionType,
        language,
        timestamp: new Date().toISOString()
      };
      
      addMessage(aiMessage);
      
    } catch (error) {
      console.error('Error:', error);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `Sorry, there was an error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewConversation={createNewConversation}
        onConversationSelect={switchConversation}
        onDeleteConversation={(id) => {
          setConversations(prev => prev.filter(c => c.id !== id));
          if (currentConversationId === id) {
            setCurrentConversationId(null);
            setMessages([]);
          }
        }}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="small"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap size={24} />
              AI Bootcamp Tutor
            </h1>
          </div>
          
          <Button
            variant="outline"
            size="small"
            onClick={createNewConversation}
            className="hidden md:flex items-center gap-2"
          >
            <Sparkles size={16} />
            New Chat
          </Button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <GraduationCap size={96} className="mx-auto text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to AI Bootcamp Tutor
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Get instant help with your studies! Generate summaries, explanations, and practice exercises.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="mb-2 flex justify-center">
                      <FileText size={32} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-900">Summarize</h3>
                    <p className="text-sm text-blue-700">Get concise summaries of complex topics</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="mb-2 flex justify-center">
                      <BookOpen size={32} className="text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-900">Explain</h3>
                    <p className="text-sm text-green-700">Get detailed explanations with examples</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="mb-2 flex justify-center">
                      <Dumbbell size={32} className="text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-900">Practice</h3>
                    <p className="text-sm text-purple-700">Generate exercises to test your knowledge</p>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">AI is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <InputArea onSubmit={handleSubmit} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatInterface;