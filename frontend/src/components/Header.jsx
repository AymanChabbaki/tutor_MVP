import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              AI Bootcamp Tutor MVP
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            Powered by AI
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;