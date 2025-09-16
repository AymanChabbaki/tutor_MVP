import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import { testConnection } from './services/api';

function App() {
  const [apiConnected, setApiConnected] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Main Chat Interface */}
      <ChatInterface />
    </div>
  );
}

export default App;