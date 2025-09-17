import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Spinner from '../components/Spinner';
import ChatInterfaceV2 from '../components/ChatInterfaceV2';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionKey, setSessionKey] = useState(0); // Force re-render of chat when session changes
  const [currentChatData, setCurrentChatData] = useState(null); // Store loaded chat data
  const [sidebarRefresh, setSidebarRefresh] = useState(0); // Trigger sidebar refresh

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleChatLoad = (chatData) => {
    setCurrentChatData(chatData);
    setSessionKey(prev => prev + 1); // Force re-render of ChatInterface
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setCurrentChatData(null);
    setSessionKey(prev => prev + 1); // Force re-render to start fresh
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleSessionCreated = (newSession) => {
    setCurrentSessionId(newSession?.id || null);
    setSidebarRefresh(prev => prev + 1); // Trigger sidebar refresh
  };

  const handleMessageSaved = (updatedChat) => {
    setSidebarRefresh(prev => prev + 1); // Trigger sidebar refresh when messages are saved
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="large" />
      </div>
    );
  }

  const renderMainContent = () => {
    return (
      <div className="flex-1 flex flex-col">
        <ChatInterfaceV2 
          key={sessionKey}
          sessionId={currentSessionId}
          className="flex-1"
          onSessionCreated={handleSessionCreated}
          initialChatData={currentChatData}
          onMessageSaved={handleMessageSaved}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onMenuClick={toggleSidebar}
        user={user}
      />

      <div className="flex">
        {/* Session History Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          currentSessionId={currentSessionId}
          setCurrentSessionId={setCurrentSessionId}
          onChatLoad={handleChatLoad}
          refreshTrigger={sidebarRefresh}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Ready to continue your learning journey?
              </p>
            </div>

            {/* Main Content Area */}
            {renderMainContent()}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default Dashboard;