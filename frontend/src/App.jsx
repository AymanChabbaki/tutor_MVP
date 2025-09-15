import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import ResultsPage from './pages/ResultsPage';
import Button from './components/Button';
import { testConnection } from './services/api';

function App() {
  // State management
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Check API connection on startup
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await testConnection();
        setApiConnected(true);
      } catch (error) {
        console.error('API connection failed:', error);
        setApiConnected(false);
      }
    };

    checkConnection();
  }, []);

  // Event handlers
  const addToHistory = (type, originalText, content, language) => {
    const newItem = {
      id: Date.now().toString(),
      type,
      originalText,
      content,
      language,
      timestamp: new Date().toISOString()
    };
    
    setHistory(prev => [newItem, ...prev]); // Add to beginning of array
    setSidebarOpen(true); // Auto-open sidebar when content is generated
  };

  const handleSummaryGenerated = (originalText, summary, language) => {
    addToHistory('summary', originalText, summary, language);
  };

  const handleExplanationGenerated = (originalText, explanation, language) => {
    addToHistory('explanation', originalText, explanation, language);
  };

  const handleExercisesGenerated = (originalText, exercises, language) => {
    addToHistory('exercises', originalText, exercises, language);
    setResults(exercises);
  };

  const handleResultsGenerated = (newResults) => {
    setResults(newResults);
  };

  const handleHistoryItemClick = (item) => {
    setSelectedHistoryItem(item);
    setSidebarOpen(false); // Close sidebar when item is clicked
  };

  const clearHistory = () => {
    setHistory([]);
    setSidebarOpen(false);
    setSelectedHistoryItem(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Router>
      <div className="app-container">
        {/* Header */}
        <Header />

        {/* API Connection Status */}
        {apiConnected === false && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Unable to connect to the backend server. Please ensure the backend is running on http://localhost:5000
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <div className="main-layout">
          {/* Mobile menu button */}
          {history.length > 0 && (
            <Button
              onClick={toggleSidebar}
              className="mobile-menu-btn lg:hidden"
              variant="ghost"
              size="small"
              aria-label="Toggle history sidebar"
            >
              �
            </Button>
          )}

          {/* Sidebar */}
          {history.length > 0 && (
            <>
              {/* Mobile overlay */}
              {sidebarOpen && (
                <div 
                  className="sidebar-overlay"
                  onClick={closeSidebar}
                />
              )}
              
              {/* Sidebar component */}
              <Sidebar
                history={history}
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
                onClearHistory={clearHistory}
                onItemClick={handleHistoryItemClick}
                className="custom-scrollbar"
              />
            </>
          )}

          {/* Main Content */}
          <main className={`main-content ${history.length > 0 ? 'has-sidebar' : ''} min-h-content`}>
            <Routes>
              <Route 
                path="/" 
                element={
                  <ChatPage
                    onSummaryGenerated={handleSummaryGenerated}
                    onExplanationGenerated={handleExplanationGenerated}
                    onExercisesGenerated={handleExercisesGenerated}
                    onResultsGenerated={handleResultsGenerated}
                    setSidebarOpen={setSidebarOpen}
                    selectedHistoryItem={selectedHistoryItem}
                  />
                } 
              />
              <Route 
                path="/old-home" 
                element={
                  <HomePage
                    onSummaryGenerated={handleSummaryGenerated}
                    onExplanationGenerated={handleExplanationGenerated}
                    onExercisesGenerated={handleExercisesGenerated}
                    onResultsGenerated={handleResultsGenerated}
                    setSidebarOpen={setSidebarOpen}
                  />
                } 
              />
              <Route 
                path="/results" 
                element={
                  <ResultsPage 
                    results={results}
                  />
                } 
              />
            </Routes>
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
